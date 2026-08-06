import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration, Group } from "@/models";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: eventId } = await params;
    const userId = session.user.id;

    await connectToDb();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.eventType === "individual") {
      const registration = await Registration.findOne({ eventId, userId });
      if (!registration) {
        return NextResponse.json({ status: "unregistered" }, { status: 200 });
      }
      return NextResponse.json({ status: registration.status }, { status: 200 });
    } else {
      const group = await Group.findOne({ event: eventId, members: userId });
      if (!group) {
        return NextResponse.json({ status: "unregistered" }, { status: 200 });
      }
      const registration = await Registration.findOne({ eventId, groupId: group._id });
      if (!registration) {
        return NextResponse.json({ status: "unregistered" }, { status: 200 });
      }
      return NextResponse.json({ status: registration.status }, { status: 200 });
    }
  } catch (error) {
    console.error("Error fetching attendance status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
