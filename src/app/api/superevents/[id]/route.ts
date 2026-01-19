// app/api/super-events/[id]/route.ts
import { connectToDb } from "@/lib/connectToDb";
import { SuperEvent } from "@/models/superevent.model";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDb();

  const { id } = await params;

  const superEvent = await SuperEvent.findById(id).populate("organizingClub");

  if (!superEvent) {
    return NextResponse.json(
      { message: "SuperEvent not found" },
      { status: 404 },
    );
  }

  return NextResponse.json(superEvent);
}
