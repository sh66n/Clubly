import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Club } from "@/models";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

/* ======================= GET ======================= */
export const GET = async (req: NextRequest) => {
  try {
    await connectToDb();

    const allEvents = await Event.find({})
      .sort({ date: 1 }) // newest first
      .populate("participants")
      .populate("registrations")
      .populate("organizingClub");

    const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() || "";
    const clubId = req.nextUrl.searchParams.get("club");

    let filteredEvents = allEvents;

    if (q) {
      filteredEvents = filteredEvents.filter((event) =>
        event.name.toLowerCase().includes(q),
      );
    }

    if (clubId && Types.ObjectId.isValid(clubId)) {
      filteredEvents = filteredEvents.filter(
        (event) =>
          event.organizingClub &&
          event.organizingClub._id.toString() === clubId,
      );
    }

    return NextResponse.json(filteredEvents, { status: 200 });
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
    });

    /* ---------- Update Club ---------- */
    await Club.findByIdAndUpdate(organizingClub, {
      $push: { events: event._id },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
};
