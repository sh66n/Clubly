import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import { connectToDb } from "@/lib/connectToDb";
import { Hackathon, HackathonRegistration } from "@/models";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

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

    const hackathons = await Hackathon.find(query)
      .sort({ createdAt: -1 })
      .populate("organizingClub")
      .lean();

    const hackathonIds = hackathons.map((h) => h._id);

    const regCounts = await HackathonRegistration.aggregate([
      { $match: { hackathon: { $in: hackathonIds } } },
      {
        $group: {
          _id: "$hackathon",
          count: { $sum: 1 },
        },
      },
    ]);

    const regCountMap = new Map(
      regCounts.map((row) => [row._id.toString(), row.count])
    );

    const hackathonsWithCounts = hackathons.map((h: any) => ({
      ...h,
      registrationCount: regCountMap.get(h._id.toString()) || 0,
    }));

    return NextResponse.json(hackathonsWithCounts, { status: 200 });
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
    let organizingClub = formData.get("organizingClub") as string;
    if (!organizingClub && session?.user?.adminClub) {
      organizingClub = session.user.adminClub.toString();
    }

    // check if the hackathon being created belongs to the club of the club-admin
    if (!organizingClub || organizingClub.toString() !== session?.user?.adminClub?.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as string;
    const teamSize = formData.get("teamSize") ? Number(formData.get("teamSize")) : undefined;
    
    const teamSizeRangeRaw = formData.get("teamSizeRange") as string | null;
    let teamSizeRange;
    if (teamSizeRangeRaw) {
      try {
        teamSizeRange = JSON.parse(teamSizeRangeRaw);
      } catch (e) {}
    }

    const submissionConfigRaw = formData.get("submissionConfig") as string | null;
    let submissionConfig;
    if (submissionConfigRaw) {
      try {
        submissionConfig = JSON.parse(submissionConfigRaw);
      } catch (e) {}
    }

    const prize = formData.get("prize") ? Number(formData.get("prize")) : undefined;
    const maxRegistrations = formData.get("maxRegistrations") ? Number(formData.get("maxRegistrations")) : undefined;
    const isRegistrationOpen = formData.get("isRegistrationOpen") === "true";
    
    const contactRaw = formData.get("contact") as string | null;
    let contact;
    if (contactRaw) {
      try {
        contact = JSON.parse(contactRaw);
      } catch (e) {}
    }

    const whatsappGroupLink = formData.get("whatsappGroupLink") as string | null;

    const customQuestionsRaw = formData.get("customQuestions") as string | null;
    let customQuestions: any[] = [];
    if (customQuestionsRaw) {
      try {
        const parsed = JSON.parse(customQuestionsRaw);
        if (Array.isArray(parsed)) {
          customQuestions = parsed;
        }
      } catch (e) {
        return NextResponse.json({ error: "Invalid customQuestions payload" }, { status: 400 });
      }
    }

    // Validate customQuestions
    const ids = new Set<string>();
    for (const q of customQuestions) {
      if (!q.id || !q.question?.trim()) {
        return NextResponse.json({ error: "Each custom question needs id and text" }, { status: 400 });
      }
      if (ids.has(q.id)) {
        return NextResponse.json({ error: "Custom question ids must be unique" }, { status: 400 });
      }
      ids.add(q.id);
      if (!["text", "select", "multiselect"].includes(q.type)) {
        return NextResponse.json({ error: "Invalid custom question type" }, { status: 400 });
      }
      if (q.type !== "text") {
        const options = (q.options || []).filter(Boolean);
        if (options.length === 0) {
          return NextResponse.json({ error: "Select and multiselect questions require options" }, { status: 400 });
        }
      }
    }

    const providesCertificate = formData.get("providesCertificate") === "true";
    const numberOfWinners = formData.get("numberOfWinners") ? Number(formData.get("numberOfWinners")) : undefined;

    const pointsRaw = formData.get("points") as string | null;
    let points;
    if (pointsRaw) {
      try {
        points = JSON.parse(pointsRaw);
      } catch (e) {}
    }

    /* ---------- Image Upload ---------- */
    const file = formData.get("image") as unknown as File | null;
    let banner = "";

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "image", folder: "hackathon-banners" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      banner = uploadResult.secure_url;
    }

    /* ---------- Create Hackathon ---------- */
    const hackathon = await Hackathon.create({
      organizingClub,
      name,
      description,
      status: status || "draft",
      image: banner,
      teamSize,
      teamSizeRange,
      submissionConfig,
      prize,
      maxRegistrations,
      isRegistrationOpen,
      contact,
      whatsappGroupLink,
      customQuestions,
      providesCertificate,
      numberOfWinners,
      points,
    });

    return NextResponse.json(hackathon, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
};
