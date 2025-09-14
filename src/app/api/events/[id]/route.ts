import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const session = await auth();
    await connectToDb();
    const { id } = await params;
    const event = await Event.findById(id)
      .populate("registrations")
      .populate("participants")
      .populate("contact")
      .populate("organizingClub")
      .populate("winners")
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
      (p: any) => p.toString?.() === session?.user.id
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
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error }, { status: 500 });
  }
};

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectToDb();
    const { id } = await params;
    const body = await req.json();
    const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ updatedEvent }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
