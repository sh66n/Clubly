import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { Group } from "@/models";
import { auth } from "@/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDb();

    const session = await auth();
    if (!session || session.user.id !== id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch groups where the user is the leader, sorted by newest
    const groups = await Group.find({ leader: id })
      .populate("members", "name email image _id")
      .populate("leader", "name email image _id")
      .populate("event", "name groupSize teamSize teamSizeRange") // To know the context
      .sort({ createdAt: -1 });

    return NextResponse.json(groups, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
