import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Group } from "@/models";
import { NextResponse } from "next/server";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ groupId: string; userId: string }> },
) {
  try {
    await connectToDb();

    // make sure user is logged in
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { groupId, userId } = await params;

    // make sure the "removing" is done by the leader only
    const group = await Group.findById(groupId);
    if (!group)
      return NextResponse.json({ error: "Group not found." }, { status: 400 });
    if (group.leader.toString() !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // make sure the user being removed is actually a member
    const isMember = group.members.some((id: any) => id.toString() === userId);

    if (!isMember) {
      return NextResponse.json(
        { error: "User is not a member of this group" },
        { status: 404 },
      );
    }

    // make sure the leader can't remove themselves
    if (userId === group.leader.toString()) {
      return NextResponse.json(
        { error: "The leader cannot be removed from the group" },
        { status: 400 },
      );
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true },
    );

    if (!updatedGroup) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Member removed", success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
