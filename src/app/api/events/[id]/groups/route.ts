import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";
import { Group } from "@/models";
import crypto from "crypto";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDb();

    // ✅ ensure event exists
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // ✅ fetch only public groups for this event
    const groups = await Group.find({ event: event._id })
      .populate("members", "name email image")
      .populate("leader", "name email image");

    return NextResponse.json(groups, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDb();

    // get current user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // get event
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, isPublic } = body;

    //  validate: eventType must allow groups
    if (event.eventType !== "team") {
      return NextResponse.json(
        { error: "Groups can only be created for team events" },
        { status: 400 }
      );
    }

    //  create joinCode for private groups
    let joinCode: string | undefined;
    if (!isPublic) {
      joinCode = crypto.randomBytes(3).toString("hex"); // 6-char code
    }

    //  create group
    const group = await Group.create({
      name: name || "Untitled Group",
      leader: userId,
      members: [userId],
      event: event._id,
      isPublic,
      joinCode,
      maxSize: event.teamSize, // inherit from event
    });

    //  push group into event registrations
    // event.registrations.push(group._id);
    // await event.save();

    return NextResponse.json(group, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
