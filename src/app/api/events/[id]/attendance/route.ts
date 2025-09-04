// src/app/api/events/[id]/attendance/route.ts
import { NextResponse } from "next/server";
import { assignPoints } from "@/services/assignPoints";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { present, absent } = await req.json();
    const updatedEvent = await assignPoints(params.id, present, absent);
    return NextResponse.json(updatedEvent);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
