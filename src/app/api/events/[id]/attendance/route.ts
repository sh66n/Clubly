// src/app/api/events/[id]/attendance/route.ts
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration } from "@/models";
import { assignPointsForEvent } from "@/services/assignPoints";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDb();
    const event = await Event.findById(id);
    if (!event)
      return NextResponse.json(
        { error: "Event does not exist" },
        { status: 400 },
      );

    if (
      event.organizingClub.toString() !== session.user.adminClub?.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { present, absent } = await req.json();
    const updatedEvent = await assignPointsForEvent(id, present, absent);
    return NextResponse.json(updatedEvent);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDb();
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json(
        { error: "Event does not exist" },
        { status: 404 },
      );
    }

    if (
      event.organizingClub.toString() !== session.user.adminClub?.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { registrationId, status } = await req.json();

    if (!registrationId || !["registered", "attended", "absent"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid registrationId or status" },
        { status: 400 },
      );
    }

    const updatedReg = await Registration.findOneAndUpdate(
      { _id: registrationId, eventId: id },
      {
        $set: {
          status,
          attendedAt: status === "attended" ? new Date() : undefined,
        },
      },
      { new: true }
    );

    if (!updatedReg) {
      return NextResponse.json(
        { error: "Registration not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { success: true, registration: updatedReg },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("PATCH /api/events/[id]/attendance error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
