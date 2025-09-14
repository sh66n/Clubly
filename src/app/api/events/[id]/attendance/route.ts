// src/app/api/events/[id]/attendance/route.ts
import { assignPointsForEvent } from "@/services/assignPoints";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { present, absent } = await req.json();
    const updatedEvent = await assignPointsForEvent(params.id, present, absent);
    return NextResponse.json(updatedEvent);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
