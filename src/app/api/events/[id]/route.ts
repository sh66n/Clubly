import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group, Registration } from "@/models";
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

    const options = (question.options ?? [])
      .map((opt) => opt.trim())
      .filter(Boolean);
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

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    // check if logged in
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDb();
    const { id } = await params;

    // Fetch event with basic populates
    const event = await Event.findById(id)
      .populate("contact")
      .populate("organizingClub")
      .populate("winner")
      .populate({
        path: "winnerGroup",
        populate: [
          { path: "members", select: "name email image" },
          { path: "leader", select: "name email image" },
        ],
      });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const canViewInsights =
      session?.user?.role === "club-admin" &&
      session?.user?.adminClub?.toString() === event.organizingClub?._id?.toString();

    // Fetch registrations/participants from Registration collection
    let registeredUsers: any[] = [];
    let attendedUsers: any[] = [];
    let registeredGroups: any[] = [];
    let attendedGroups: any[] = [];
    let registrationCount = 0;

    if (event.eventType === "team") {
      registrationCount = await Registration.countDocuments({
        eventId: id,
        groupId: { $exists: true },
      });

      if (canViewInsights) {
        const regs = await Registration.find({
          eventId: id,
          groupId: { $exists: true },
        }).populate({
          path: "groupId",
          populate: [
            { path: "members", select: "name email image" },
            { path: "leader", select: "name email image" },
          ],
        });

        registeredGroups = regs.filter((r) => r.groupId).map((r) => r.groupId);

        attendedGroups = regs
          .filter((r) => r.status === "attended" && r.groupId)
          .map((r) => r.groupId);
      }
    } else {
      registrationCount = await Registration.countDocuments({
        eventId: id,
        userId: { $exists: true },
      });

      if (canViewInsights) {
        const regs = await Registration.find({
          eventId: id,
          userId: { $exists: true },
        }).populate("userId", "name email image");

        registeredUsers = regs.filter((r) => r.userId).map((r) => r.userId);

        attendedUsers = regs
          .filter((r) => r.status === "attended" && r.userId)
          .map((r) => r.userId);
      }
    }

    // Check if user has a group for this event
    let myGroup = null;
    if (event.eventType === "team" && session?.user.id) {
      myGroup = await Group.findOne({
        event: event._id,
        members: session.user.id,
      })
        .populate("members", "name email image")
        .populate("leader", "name email image");
    }

    // Check if user is already registered
    let alreadyRegistered = false;
    if (event.eventType === "team") {
      // Check if user's group is registered
      if (myGroup) {
        const groupReg = await Registration.exists({
          eventId: id,
          groupId: myGroup._id,
        });
        alreadyRegistered = !!groupReg;
      }
    } else {
      // Check if user is individually registered
      const userReg = await Registration.exists({
        eventId: id,
        userId: session.user.id,
      });
      alreadyRegistered = !!userReg;
    }

    // temporary fix for changing price according to email
    if (
      event._id.toString() === "69a7fa06cd938ddb63b0f06f" &&
      session?.user?.email?.endsWith("@pvppcoe.ac.in")
    ) {
      event.registrationFee = 0;
    }

    // Build response with registrations attached
    const eventResponse = {
      ...event.toObject(),
      registeredUsers,
      attendedUsers,
      registeredGroups,
      attendedGroups,
      registrationCount,
    };

    return NextResponse.json(
      { event: eventResponse, myGroup, alreadyRegistered },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();

    // check if logged in
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // check if club-admin
    if (session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDb();
    const { id } = await params;
    const formData = await req.formData();

    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // check if the event being updated belongs to the club of the club-admin
    if (
      event.organizingClub.toString() !== session?.user?.adminClub?.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const ALLOWED_FIELDS = [
      "name",
      "description",
      "date",
      "eventTime",
      "eventType",
      "teamSize",
      "teamSizeRange.min",
      "teamSizeRange.max",
      "prize",
      "providesCertificate",
      "registrationFee",
      "maxRegistrations",
      "isRegistrationOpen",
      "customQuestions",
    ];

    //  Convert FormData → plain object
    const body: any = {};
    for (const [key, value] of formData.entries()) {
      if (value === "") continue;

      // Convert "teamSizeRange[min]" to "teamSizeRange.min" for mongoose
      const parsedKey = key.replace(/\[/g, ".").replace(/\]/g, "");

      // Strictly allow-list to prevent mass-assignment vulnerability
      if (!ALLOWED_FIELDS.includes(parsedKey) && parsedKey !== "image") {
        continue;
      }

      if (
        parsedKey === "providesCertificate" ||
        parsedKey === "isRegistrationOpen"
      ) {
        body[parsedKey] = value === "true";
      } else if (
        [
          "teamSize",
          "teamSizeRange.min",
          "teamSizeRange.max",
          "prize",
          "registrationFee",
          "maxRegistrations",
        ].includes(parsedKey)
      ) {
        body[parsedKey] = Number(value);
      } else {
        body[parsedKey] = value;
      }
    }

    // upload image to cloudinary (ONLY if provided)
    const file = formData.get("image") as File | null;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "image" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      body.image = uploadResult.secure_url;
    }

    //change date and time
    // Handle date + time properly (IST -> UTC)
    if (body.date) {
      const dateStr = body.date; // "2026-02-10"
      const timeStr = body.eventTime || "00:00"; // "10:00"

      // Explicit IST datetime
      const istDateTime = new Date(`${dateStr}T${timeStr}:00+05:30`);

      body.date = istDateTime; // Mongo stores as UTC internally
      delete body.eventTime;
    }

    // Validate maxRegistrations
    if (body.maxRegistrations !== undefined && body.maxRegistrations < 1) {
      return NextResponse.json(
        { error: "maxRegistrations must be at least 1" },
        { status: 400 },
      );
    }

    if (body.customQuestions !== undefined) {
      let parsedCustomQuestions: CustomQuestionInput[] = [];
      try {
        parsedCustomQuestions = JSON.parse(body.customQuestions);
      } catch {
        return NextResponse.json(
          { error: "Invalid customQuestions payload" },
          { status: 400 },
        );
      }

      if (!Array.isArray(parsedCustomQuestions)) {
        return NextResponse.json(
          { error: "customQuestions must be an array" },
          { status: 400 },
        );
      }

      parsedCustomQuestions = sanitizeCustomQuestions(parsedCustomQuestions);

      const customQuestionsValidation =
        validateCustomQuestions(parsedCustomQuestions);
      if (!customQuestionsValidation.valid) {
        return NextResponse.json(
          { error: customQuestionsValidation.error },
          { status: 400 },
        );
      }

      body.customQuestions = parsedCustomQuestions;
    }

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true },
    );

    return NextResponse.json({ event: updatedEvent }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update event" },
      { status: 500 },
    );
  }
};
