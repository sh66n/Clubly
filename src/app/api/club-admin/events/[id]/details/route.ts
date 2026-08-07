import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration, Payment, Feedback, Group, User } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // 1. Fetch Event and verify ownership
    const event = await Event.findById(id)
      .populate("likedBy", "name email image")
      .populate("contact", "name email image")
      .populate("winner", "name email image")
      .populate("winnerGroup", "name")
      .populate("superEvent", "name image")
      .lean();
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizingClub.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Fetch Registrations and populate users
    const registrations = await Registration.find({ eventId: id })
      .populate("userId", "name email image department")
      .populate({
        path: "groupId",
        select: "name members leader",
        populate: [
          {
            path: "members",
            select: "name email image department"
          },
          {
            path: "leader",
            select: "name email image department"
          }
        ]
      })
      .lean();

    // 3. Fetch Groups/Teams for this event
    const groups = await Group.find({ event: id })
      .populate("members", "name email image")
      .populate("leader", "name email")
      .lean();

    // 4. Fetch Payments made for this event
    const payments = await Payment.find({ eventId: id, status: "paid" })
      .populate("userId", "name email")
      .lean();

    // 5. Fetch Feedback reviews
    const feedbacks = await Feedback.find({ eventId: id })
      .populate("userId", "name email image")
      .lean();

    return NextResponse.json({
      event,
      registrations,
      groups,
      payments,
      feedbacks,
    }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/club-admin/events/[id]/details error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
