import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group } from "@/models";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string; groupId: string }> },
) {
  try {
    const { id, groupId } = await params;
    await connectToDb();

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const group = await Group.findById(groupId);
    if (!group || !group.event.equals(event._id)) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    if (!group.members.includes(userId)) {
      return NextResponse.json(
        { error: "You are not in this group" },
        { status: 400 },
      );
    }

    // Remove user from members
    const updatedMembers = group.members.filter(
      (memberId: any) => memberId.toString() !== userId,
    );

    if (updatedMembers.length === 0) {
      // If group is empty, delete it
      await Group.findByIdAndDelete(groupId);
      return NextResponse.json(
        { message: "Group deleted as it is empty" },
        { status: 200 },
      );
    }

    // If user is the leader, reassign leadership to the first available member
    let updatedLeader = group.leader;
    if (group.leader.toString() === userId) {
      updatedLeader = updatedMembers[0];
    }

    group.members = updatedMembers;
    group.leader = updatedLeader;
    await group.save();

    return NextResponse.json(
      { message: "Left group successfully" },
      { status: 200 },
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
