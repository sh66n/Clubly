import { NextRequest, NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group, Registration } from "@/models";
import { auth } from "@/auth";
import mongoose from "mongoose";
import crypto from "crypto";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; groupId: string }> },
) {
  try {
    const { id, groupId } = await params;

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

    // ✏️ Apply ONLY allowed fields atomically
    const updateBody: any = {};
    if (name !== undefined) updateBody.name = name;
    if (isPublic !== undefined) {
      updateBody.isPublic = isPublic;
      // if switching from public -> private, generate joinCode
      if (group.isPublic && !isPublic) {
        updateBody.joinCode = crypto.randomBytes(3).toString("hex"); // 6-char code
      }
      // if switching from private -> public, remove joinCode (using $unset or null)
      if (!group.isPublic && isPublic) {
        updateBody.joinCode = null; // or use $unset
      }
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $set: updateBody },
      { new: true },
    );

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

    // 🧹 Remove group registration from Registration collection
    await Registration.deleteOne({ eventId: group.event, groupId: group._id });

    // Clear winnerGroup if this group was the winner
    await Event.updateOne(
      { _id: group.event, winnerGroup: group._id },
      { $set: { winnerGroup: null } },
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
