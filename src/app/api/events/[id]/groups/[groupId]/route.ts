import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group } from "@/models";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: { id: string; groupId: string } }
) {
  try {
    const { id, groupId } = params;
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
      { status: 200 }
    );
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
