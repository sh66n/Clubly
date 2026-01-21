// src/app/api/events/[id]/attendance/route.ts
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";
import { IEvent } from "@/models/event.schema";
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
