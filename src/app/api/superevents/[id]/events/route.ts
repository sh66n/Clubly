// app/api/super-events/[id]/events/route.ts
import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDb();

  const { id } = await params;

  const events = await Event.find({
    superEvent: id,
  }).sort({ date: 1 });

  return NextResponse.json(events);
}
