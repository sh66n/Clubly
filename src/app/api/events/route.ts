import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration } from "@/models";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

type CustomQuestionInput = {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect";
  required: boolean;
  options?: string[];
};

const validateCustomQuestions = (
  customQuestions: CustomQuestionInput[],
): { valid: true } | { valid: false; error: string } => {
  const ids = new Set<string>();

  for (const question of customQuestions) {
    if (!question.id || !question.question?.trim()) {
      return { valid: false, error: "Each custom question needs id and text" };
    }

    if (ids.has(question.id)) {
      return { valid: false, error: "Custom question ids must be unique" };
    }
    ids.add(question.id);

    if (!["text", "select", "multiselect"].includes(question.type)) {
      return { valid: false, error: "Invalid custom question type" };
    }

    if (question.type === "text") {
      continue;
    }

    const options = (question.options ?? []).map((opt) => opt.trim()).filter(Boolean);
    if (options.length === 0) {
      return {
        valid: false,
        error: "Select and multiselect questions require options",
      };
    }
  }

  return { valid: true };
};

const sanitizeCustomQuestions = (
  customQuestions: CustomQuestionInput[],
): CustomQuestionInput[] =>
  customQuestions
    .map((question) => ({
      id: String(question.id ?? "").trim(),
      question: String(question.question ?? "").trim(),
      type: question.type,
      required: Boolean(question.required),
      options:
        question.type === "text"
          ? []
          : (question.options ?? [])
              .map((option) => String(option).trim())
              .filter((option) => option.length > 0),
    }))
    .filter((question) => question.id.length > 0 && question.question.length > 0);

/* ======================= GET ======================= */
export const GET = async (req: NextRequest) => {
  try {
    await connectToDb();
    const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
    const clubId = req.nextUrl.searchParams.get("club");
    const query: Record<string, unknown> = {};

    if (q) {
      query.name = { $regex: q, $options: "i" };
    }

    if (clubId && Types.ObjectId.isValid(clubId)) {
      query.organizingClub = new Types.ObjectId(clubId);
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .populate("organizingClub")
      .lean();

    const eventIds = events.map((event) => event._id);

    const regCounts = await Registration.aggregate([
      { $match: { eventId: { $in: eventIds } } },
      {
        $group: {
          _id: "$eventId",
          individualCount: {
            $sum: {
              $cond: [{ $ifNull: ["$userId", false] }, 1, 0],
            },
          },
          teamCount: {
            $sum: {
              $cond: [{ $ifNull: ["$groupId", false] }, 1, 0],
            },
          },
        },
      },
    ]);

    const regCountMap = new Map(
      regCounts.map((row) => [
        row._id.toString(),
        {
          individualCount: row.individualCount ?? 0,
          teamCount: row.teamCount ?? 0,
        },
      ]),
    );

    const eventsWithCounts = events.map((event: any) => {
      const counts = regCountMap.get(event._id.toString());
      const registrationCount =
        event.eventType === "team"
          ? (counts?.teamCount ?? 0)
          : (counts?.individualCount ?? 0);

      return {
        ...event,
        registrationCount,
      };
    });

    return NextResponse.json(eventsWithCounts, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
};

/* ======================= POST ======================= */
export const POST = async (req: NextRequest) => {
  try {
    await connectToDb();

    // check if logged in
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check if club-admin
    if (session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const organizingClub = formData.get("organizingClub") as string;

    // check if the event being created belongs to the club of the club-admin
    if (organizingClub.toString() !== session?.user?.adminClub?.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // safe to create event

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const eventTime = (formData.get("eventTime") as string) || "00:00"; // "18:30"

    // save time with date
    const [year, month, day] = date.split("-").map(Number);
    const [hours, minutes] = eventTime.split(":").map(Number);
    const eventDate = new Date(year, month - 1, day, hours, minutes, 0, 0);

    const eventType = formData.get("eventType") as string;

    const teamSize = formData.get("teamSize") as string | null;
    const teamSizeMin = formData.get("teamSizeRange[min]") as string | null;
    const teamSizeMax = formData.get("teamSizeRange[max]") as string | null;

    const prize = formData.get("prize") as string | null;
    const providesCertificate = formData.get("providesCertificate") === "true";
    const registrationFee = formData.get("registrationFee") as string | null;
    const maxRegistrations = formData.get("maxRegistrations") as string | null;
    const superEvent = formData.get("superEvent") as string | null;
    const customQuestionsRaw = formData.get("customQuestions") as string | null;
    let customQuestions: CustomQuestionInput[] = [];

    if (customQuestionsRaw) {
      try {
        const parsed = JSON.parse(customQuestionsRaw);
        if (!Array.isArray(parsed)) {
          return NextResponse.json(
            { error: "customQuestions must be an array" },
            { status: 400 },
          );
        }
        customQuestions = parsed;
      } catch {
        return NextResponse.json(
          { error: "Invalid customQuestions payload" },
          { status: 400 },
        );
      }
    }

    customQuestions = sanitizeCustomQuestions(customQuestions);

    const customQuestionsValidation = validateCustomQuestions(customQuestions);
    if (!customQuestionsValidation.valid) {
      return NextResponse.json(
        { error: customQuestionsValidation.error },
        { status: 400 },
      );
    }

    /* ---------- Image Upload ---------- */
    const file = formData.get("image") as unknown as File | null;
    let imageUrl = "";

    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    /* ---------- Team Size Logic ---------- */
    let finalTeamSize: number | undefined = undefined;
    let teamSizeRange: { min: number; max: number } | undefined = undefined;

    if (eventType === "individual") {
      finalTeamSize = 1;
    }

    if (eventType === "team") {
      // Range has priority
      if (teamSizeMin && teamSizeMax) {
        const min = Number(teamSizeMin);
        const max = Number(teamSizeMax);

        if (min > max) {
          return NextResponse.json(
            { message: "Invalid team size range" },
            { status: 400 },
          );
        }

        teamSizeRange = { min, max };
      } else if (teamSize) {
        finalTeamSize = Number(teamSize);
      }
    }

    /* ---------- Create Event ---------- */
    const event = await Event.create({
      organizingClub,
      name,
      description,
      date: eventDate,
      eventType,
      teamSize: finalTeamSize,
      teamSizeRange,
      prize: prize ? Number(prize) : undefined,
      providesCertificate,
      registrationFee: registrationFee ? Number(registrationFee) : 0,
      image: imageUrl,
      maxRegistrations: maxRegistrations ? Number(maxRegistrations) : undefined,
      superEvent: superEvent || undefined,
      customQuestions,
    });

    // Note: Events are linked to clubs via organizingClub field, no need to maintain club.events array

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
};
