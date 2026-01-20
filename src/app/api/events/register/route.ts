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

    // Fetch event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    /* ---------------- Registration Limit ---------------- */
    if (event.eventType === "individual") {
      if (
        event.maxRegistrations &&
        event.registrations.length >= event.maxRegistrations
      ) {
        return NextResponse.json(
          { error: "Registration limit exceeded!" },
          { status: 400 },
        );
      }
    } else {
      if (
        event.maxRegistrations &&
        event.groupRegistrations.length >= event.maxRegistrations
      ) {
        return NextResponse.json(
          { error: "Registration limit exceeded!" },
          { status: 400 },
        );
      }
    }

    /* ================= INDIVIDUAL ================= */
    if (event.eventType === "individual") {
      if (!userId) {
        return NextResponse.json(
          { error: "userId is required for individual events" },
          { status: 400 },
        );
      }

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      if (event.registrations.includes(userId)) {
        return NextResponse.json(
          { error: "Already registered for this event" },
          { status: 400 },
        );
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $addToSet: { registrations: userId } },
        { new: true },
      ).populate("registrations", "name email");

      return NextResponse.json(updatedEvent, { status: 200 });
    }

    /* ================= TEAM ================= */
    if (event.eventType === "team") {
      if (!groupId) {
        return NextResponse.json(
          { error: "groupId is required for team events" },
          { status: 400 },
        );
      }

      const group = await Group.findById(groupId).populate("members");
      if (!group) {
        return NextResponse.json({ error: "Group not found" }, { status: 404 });
      }

      // Group must belong to event
      if (group.event.toString() !== event._id.toString()) {
        return NextResponse.json(
          { error: "Group does not belong to this event" },
          { status: 400 },
        );
      }

      // Duplicate registration check
      if (event.groupRegistrations.includes(groupId)) {
        return NextResponse.json(
          { error: "Already registered for this event" },
          { status: 400 },
        );
      }

      /* -------- TEAM SIZE VALIDATION (NEW) -------- */
      const memberCount = group.members.length;

      // Range has priority
      if (event.teamSizeRange?.min && event.teamSizeRange?.max) {
        const { min, max } = event.teamSizeRange;

        if (memberCount < min || memberCount > max) {
          return NextResponse.json(
            {
              error: `Team size must be between ${min} and ${max} members`,
            },
            { status: 400 },
          );
        }
      } else if (event.teamSize) {
        if (memberCount !== event.teamSize) {
          return NextResponse.json(
            {
              error: `Team size must be exactly ${event.teamSize} members`,
            },
            { status: 400 },
          );
        }
      }

      /* -------- Register Group -------- */
      const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $addToSet: { groupRegistrations: groupId } },
        { new: true },
      ).populate({
        path: "groupRegistrations",
        populate: { path: "members", select: "name email" },
      });

      return NextResponse.json(updatedEvent, { status: 200 });
    }

    return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
