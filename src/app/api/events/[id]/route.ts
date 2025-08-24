import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";
import { NextRequest, NextResponse } from "next/server";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectToDb();
    const { id } = await params;
    const body = await req.json();
    const updatedEvent = await Event.findByIdAndUpdate(id, body, { new: true });
    return NextResponse.json({ updatedEvent }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    await connectToDb();
    const { id } = await params;
    const deletedEvent = await Event.findByIdAndDelete(id, { new: true });
    return NextResponse.json({ deletedEvent }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};
