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

    const cookieName = `viewed_event_${id}`;
    const cookie = req.cookies.get(cookieName);

    if (cookie && cookie.value === "true") {
      return NextResponse.json({ message: "Already viewed" }, { status: 200 });
    }

    const event = await Event.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true, strict: false }
    );

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);

    const response = NextResponse.json({ views: event.views }, { status: 200 });
    
    response.cookies.set(cookieName, "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60, // 1 minute
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update views" }, { status: 500 });
  }
};
