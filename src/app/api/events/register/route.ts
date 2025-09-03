// src/pages/api/events/register.ts
import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models/user.model";
import { Event } from "@/models/event.model";

export async function POST(req: Request) {
  try {
    const { eventId, userId } = await req.json();
    if (!eventId || !userId) {
      return NextResponse.json(
        { error: "Missing eventId or userId" },
        { status: 400 }
      );
    }

    await connectToDb();

    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Push only if not already registered
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $addToSet: { registrations: userId } }, // avoids duplicates
      { new: true }
    ).populate("registrations", "name email");

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(updatedEvent, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
