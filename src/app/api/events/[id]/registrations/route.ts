import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { id } = await params;
  try {
    await connectToDb();
    const event = await Event.findById(id).populate("User");
    return NextResponse.json(
      { registeredUsers: event.registrations },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const { user } = await req.json();
  const { id } = await params;
  try {
    await connectToDb();
    const event = await Event.findById(id);
    event.registrations.push(user);
    await event.save();
    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};
