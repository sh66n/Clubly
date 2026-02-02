import { auth } from "@/auth";
import cloudinary from "@/lib/cloudinary";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group } from "@/models";
import { NextRequest, NextResponse } from "next/server";

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
    const event = await Event.findById(id)
      .populate("registrations")
      .populate("participants")
      .populate("contact")
      .populate("organizingClub")
      .populate("winner")
      .populate({
        path: "groupRegistrations",
        populate: [
          { path: "members", select: "name email image" },
          { path: "leader", select: "name email image" },
        ],
      })
      .populate({
        path: "participantGroups",
        populate: [
          { path: "members", select: "name email image" },
          { path: "leader", select: "name email image" },
        ],
      })
      .populate({
        path: "winnerGroup",
        populate: [
          { path: "members", select: "name email image" },
          { path: "leader", select: "name email image" },
        ],
      });

    // Check if user has a group for this event
    let myGroup = null;
    if (event.eventType === "team" && session?.user.id) {
      // Only check groups if it's a team event
      myGroup = await Group.findOne({
        event: event._id,
        members: session.user.id,
      })
        .populate("members", "name email image")
        .populate("leader", "name email image");
    }

    // Check if user is already individually registered
    const isIndividuallyRegistered = event.participants?.some(
      (p: any) => p.toString?.() === session?.user.id,
    );

    // Check if user is in any registered group
    const isGroupRegistered = await Group.exists({
      event: event._id,
      members: session?.user.id,
      _id: { $in: event.participantGroups }, // only if you store registered groups here
    });

    const alreadyRegistered = isIndividuallyRegistered || isGroupRegistered;

    return NextResponse.json(
      { event, myGroup, alreadyRegistered },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};

// export const PATCH = async (
//   req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) => {
//   try {
//     await connectToDb();
//     const { id } = await params;
//     const body = await req.json();
//     const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true });
//     return NextResponse.json({ updatedEvent }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json({ error }, { status: 500 });
//   }
// };

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

    //  Convert FormData → plain object
    const body: any = {};
    for (const [key, value] of formData.entries()) {
      if (value === "") {
        continue;
      }

      if (key === "providesCertificate") {
        body[key] = value === "true";
      } else if (
        ["teamSize", "prize", "registrationFee", "maxRegistrations"].includes(
          key,
        )
      ) {
        body[key] = Number(value);
      } else {
        body[key] = value;
      }
    }

    // upload image to cloudinary
    const file = formData.get("image") as unknown as File | null;

    if (file) {
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

      body.image = imageUrl;
    } else {
      body.image = "";
    }

    // ✅ Validate maxRegistrations
    if (body.maxRegistrations !== undefined && body.maxRegistrations < 1) {
      return NextResponse.json(
        { error: "maxRegistrations must be at least 1" },
        { status: 400 },
      );
    }

    // Optional permission check
    // if (event.createdBy.toString() !== session.user.id) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // }

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

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    await connectToDb();
    const { id } = await params;
    const deletedEvent = await Event.findByIdAndDelete(id, { new: true });
    return NextResponse.json({ deletedEvent }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};
