import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group } from "@/models";
import crypto from "crypto";
import { auth } from "@/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    await connectToDb();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // get event
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.eventType !== "team") {
      return NextResponse.json(
        { error: "Groups can only be created for team events" },
        { status: 400 }
      );
    }

    const existingGroup = await Group.findOne({
      event: event._id,
      members: userId,
    });

    if (existingGroup) {
      return NextResponse.json(
        { error: "You are already part of a group for this event" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { pastGroupId } = body;

    if (!pastGroupId) {
      return NextResponse.json(
        { error: "pastGroupId is required" },
        { status: 400 }
      );
    }

    // Find the past group
    const pastGroup = await Group.findById(pastGroupId);
    if (!pastGroup) {
      return NextResponse.json(
        { error: "Past group not found" },
        { status: 404 }
      );
    }

    if (pastGroup.leader.toString() !== userId) {
      return NextResponse.json(
        { error: "Only the group leader from the past group can clone it" },
        { status: 403 }
      );
    }

    // Verify members are not already in groups for this new event
    // For a strict approach, we check all members. If any member is already in a group for this event, we reject.
    const memberIds = pastGroup.members.map((m: any) => m.toString());

    const conflictingGroups = await Group.find({
      event: event._id,
      members: { $in: memberIds },
    });

    if (conflictingGroups.length > 0) {
      return NextResponse.json(
        { error: "One or more members of this group are already in another group for this event" },
        { status: 400 }
      );
    }

    // Group size constraints from event
    const maxSize = event.teamSize ? event.teamSize : event.teamSizeRange.max;
    if (memberIds.length > maxSize) {
      return NextResponse.json(
        { error: "Past group has more members than the maximum allowed for this event" },
        { status: 400 }
      );
    }

    let joinCode: string | undefined;
    if (!pastGroup.isPublic) {
      joinCode = crypto.randomBytes(3).toString("hex"); // 6-char code
    }

    // create new cloned group
    const newGroup = await Group.create({
      name: pastGroup.name, // keep same name
      leader: userId,
      members: memberIds,
      event: event._id,
      isPublic: pastGroup.isPublic,
      joinCode: joinCode,
      maxSize: maxSize,
    });

    return NextResponse.json(newGroup, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
