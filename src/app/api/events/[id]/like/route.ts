import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    await connectToDb();
    const { id } = await params;
    
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = session.user.id;

    let action = 'like';
    try {
      const body = await req.json();
      if (body.action) action = body.action;
    } catch (e) {
      // ignore
    }

    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (!event.likedBy) {
      event.likedBy = [];
    }

    let isLiked = false;
    
    if (action === 'like') {
      if (!event.likedBy.includes(userId)) {
        event.likedBy.push(userId);
        event.likes = (event.likes || 0) + 1;
      }
      isLiked = true;
    } else {
      event.likedBy = event.likedBy.filter((id: any) => id.toString() !== userId);
      event.likes = Math.max((event.likes || 1) - 1, 0);
      isLiked = false;
    }

    await event.save();

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);

    return NextResponse.json({ likes: event.likes, isLiked }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update likes" }, { status: 500 });
  }
};
