// src/pages/api/events/register.ts
import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models/user.model";
import { Event } from "@/models/event.model";
import { Group } from "@/models/group.model";

export async function POST(req: Request) {
  try {
    const { eventId, userId, groupId } = await req.json();
    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    await connectToDb();

    // Fetch event to check type
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.eventType === "individual") {
      if (!userId) {
        return NextResponse.json(
          { error: "userId is required for individual events" },
          { status: 400 }
        );
      }

      // Ensure user exists
      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if already registered
      if (event.registrations.includes(userId)) {
        return NextResponse.json(
          { error: "Already registered for this event" },
          { status: 400 }
        );
      }

      // Register user
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $addToSet: { registrations: userId } },
        { new: true }
      ).populate("registrations", "name email");

      return NextResponse.json(updatedEvent, { status: 200 });
    }

    if (event.eventType === "team") {
      if (!groupId) {
        return NextResponse.json(
          { error: "groupId is required for team events" },
          { status: 400 }
        );
      }

      // Ensure group exists
      const group = await Group.findById(groupId);
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      // Ensure the group belongs to this event
      if (group.event.toString() !== event._id.toString()) {
        return NextResponse.json(
          { error: "Group does not belong to this event" },
          { status: 400 }
        );
      }

      // Check if already registered
      if (event.groupRegistrations.includes(groupId)) {
        return NextResponse.json(
          { error: "Already registered for this event" },
          { status: 400 }
        );
      }

      // Register group
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $addToSet: { groupRegistrations: groupId } },
        { new: true }
      ).populate({
        path: "groupRegistrations",
        populate: { path: "members", select: "name email" },
      });

      return NextResponse.json(updatedEvent, { status: 200 });
    }

    return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
