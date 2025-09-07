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
      .populate("winners");

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

    return NextResponse.json({ event, myGroup }, { status: 200 });
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
