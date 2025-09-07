import cloudinary from "@/lib/cloudinary";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Club } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDb();

    const allEvents = await Event.find({})
      .populate("participants")
      .populate("registrations")
      .populate("organizingClub");
    return NextResponse.json(allEvents, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    await connectToDb();
    const formData = await req.formData();

    const organizingClub = formData.get("organizingClub") as string;
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const date = formData.get("date") as string;
    const eventType = formData.get("eventType") as string;
    const teamSize = formData.get("teamSize") as string | null;
    const prize = formData.get("prize") as string | null;
    const providesCertificate = formData.get("providesCertificate") === "true";
    const registrationFee = formData.get("registrationFee") as string | null;

    const file = formData.get("image") as unknown as File | null;
    let imageUrl = "";

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

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

    // Create the event (default teamSize = 1 if not provided)
    const event = await Event.create({
      organizingClub,
      name,
      description,
      date,
      eventType,
      teamSize: teamSize ? Number(teamSize) : 1,
      prize: prize ? Number(prize) : undefined,
      providesCertificate,
      registrationFee: registrationFee ? Number(registrationFee) : undefined,
      image: imageUrl,
    });

    // Update club's events array
    await Club.findByIdAndUpdate(organizingClub, {
      $push: { events: event._id },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(error, { status: 500 });
  }
};
