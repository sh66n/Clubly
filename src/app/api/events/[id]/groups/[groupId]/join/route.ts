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

    // ✅ get current user
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    // ✅ parse body (may contain joinCode)
    const body = await req.json().catch(() => ({}));
    const { joinCode } = body;

    // ✅ ensure event exists
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // ✅ ensure group exists
    const group = await Group.findById(groupId);
    if (!group || !group.event.equals(event._id)) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    // ✅ check if user already in another group for this event
    const existingGroup = await Group.findOne({
      event: event._id,
      members: userId,
    });
    if (existingGroup) {
      return NextResponse.json(
        { error: "You are already in a group for this event" },
        { status: 400 },
      );
    }

    // ✅ handle public/private
    if (group.isPublic) {
      // Public group → no join code required
    } else {
      // Private group → must have correct joinCode
      if (!joinCode) {
        return NextResponse.json(
          { error: "Join code is required for private groups" },
          { status: 400 },
        );
      }
      if (group.joinCode !== joinCode) {
        return NextResponse.json(
          { error: "Invalid join code" },
          { status: 400 },
        );
      }
    }

    // ✅ check group size
    if (group.maxSize && group.members.length >= group.maxSize) {
      return NextResponse.json({ error: "Group is full" }, { status: 400 });
    }

    // ✅ check if already a member
    if (group.members.includes(userId)) {
      return NextResponse.json(
        { error: "You are already in this group" },
        { status: 400 },
      );
    }

    // ✅ add user to group
    group.members.push(userId);
    await group.save();

    return NextResponse.json(group, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
