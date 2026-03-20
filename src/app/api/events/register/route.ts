// src/pages/api/events/register.ts
import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models/user.model";
import { Event } from "@/models/event.model";
import { Group } from "@/models/group.model";
import { Payment } from "@/models/payment.model";
import { Registration } from "@/models/registration.model";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    await connectToDb();

    // check if logged in
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { eventId, groupId } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }
    // Fetch event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.isRegistrationOpen === false) {
      return NextResponse.json(
        { error: "Registrations are currently closed for this event" },
        { status: 403 },
      );
    }

    // Payment guard: paid events require a verified payment
    if (event.registrationFee && event.registrationFee > 0) {
      const paidPayment = await Payment.findOne({
        userId: session.user.id,
        eventId,
        status: "paid",
      });

      if (!paidPayment) {
        return NextResponse.json(
          { error: "Payment required before registration" },
          { status: 402 },
        );
      }
    }

    /* ---------------- Registration Limit ---------------- */
    const currentRegistrations = await Registration.countDocuments({ eventId });
    if (
      event.maxRegistrations &&
      currentRegistrations >= event.maxRegistrations
    ) {
      return NextResponse.json(
        { error: "Registration limit exceeded!" },
        { status: 400 },
      );
    }

    /* ================= INDIVIDUAL ================= */
    if (event.eventType === "individual") {
      // Use session user ID instead of client-supplied userId
      const userId = session.user.id;

      const user = await User.findById(userId);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Check if already registered
      const existingRegistration = await Registration.exists({
        eventId,
        userId,
      });
      if (existingRegistration) {
        return NextResponse.json(
          { error: "Already registered for this event" },
          { status: 400 },
        );
      }

      // Create registration
      await Registration.create({
        eventId,
        userId,
        status: "registered",
        registeredAt: new Date(),
      });

      // Return updated registrations
      const registrations = await Registration.find({ eventId }).populate(
        "userId",
        "name email",
      );

      return NextResponse.json(
        { event, registeredUsers: registrations.map((r) => r.userId) },
        { status: 200 },
      );
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
      const existingRegistration = await Registration.exists({
        eventId,
        groupId,
      });
      if (existingRegistration) {
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
      await Registration.create({
        eventId,
        groupId,
        status: "registered",
        registeredAt: new Date(),
      });

      // Return updated group registrations
      const registrations = await Registration.find({
        eventId,
        groupId: { $exists: true },
      }).populate({
        path: "groupId",
        populate: { path: "members", select: "name email" },
      });

      return NextResponse.json(
        { event, registeredGroups: registrations.map((r) => r.groupId) },
        { status: 200 },
      );
    }

    return NextResponse.json({ error: "Unknown event type" }, { status: 400 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
