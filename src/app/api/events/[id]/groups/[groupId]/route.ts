import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group } from "@/models";
import { auth } from "@/auth";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: { id: string; groupId: string } },
) {
  try {
    const { id, groupId } = params;

    // checked if user is logged in
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDb();

    // ✅ ensure event exists
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // ✅ fetch group
    const group = await Group.findById(groupId)
      .populate("members", "name email image")
      .populate("leader", "name email image");

    if (!group || !group.event.equals(event._id)) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        _id: group._id,
        name: group.name,
        leader: group.leader,
        members: group.members,
        capacity: group.maxSize,
        isPublic: group.isPublic,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export const PATCH = async (
  req: NextRequest,
  { params }: { params: { groupId: string } },
) => {
  try {
    await connectToDb();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { message: "Invalid group ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { name, isPublic } = body;

    // 🚫 Reject empty body
    if (name === undefined && isPublic === undefined) {
      return NextResponse.json(
        { message: "Nothing to update" },
        { status: 400 },
      );
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    // 🔐 Only leader can edit
    if (group.leader.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden: Only leader can edit group" },
        { status: 403 },
      );
    }

    // ✏️ Apply ONLY allowed fields
    if (name !== undefined) group.name = name;
    if (isPublic !== undefined) group.isPublic = isPublic;

    await group.save();

    return NextResponse.json(
      {
        message: "Group updated successfully",
        group: {
          _id: group._id,
          name: group.name,
          isPublic: group.isPublic,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("EDIT GROUP ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string }> },
) => {
  try {
    await connectToDb();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { groupId } = await params;

    if (!mongoose.Types.ObjectId.isValid(groupId)) {
      return NextResponse.json(
        { message: "Invalid group ID" },
        { status: 400 },
      );
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return NextResponse.json({ message: "Group not found" }, { status: 404 });
    }

    // 🔐 Only leader can delete
    if (group.leader.toString() !== session.user.id) {
      return NextResponse.json(
        { message: "Forbidden: Only group leader can delete this group" },
        { status: 403 },
      );
    }

    // 🧹 Remove group references from Event
    await Event.updateOne(
      { _id: group.event },
      {
        $pull: { groupRegistrations: group._id, participantGroups: group._id },
        $set: { winnerGroup: null },
      },
    );

    // ❌ Delete the group
    await Group.findByIdAndDelete(groupId);

    return NextResponse.json(
      { message: "Group deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("DELETE GROUP ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
};
