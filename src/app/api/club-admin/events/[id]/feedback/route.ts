import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Feedback, User } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const session = await auth();

    if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const event = await Event.findById(id);

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizingClub.toString() !== session.user.adminClub.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const feedback = await Feedback.find({ eventId: id }).populate("userId", "name email image").lean();

    const totalCount = feedback.length;
    let totalRating = 0;
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    feedback.forEach((f: any) => {
      totalRating += f.rating;
      if (f.rating >= 1 && f.rating <= 5) {
        ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
      }
    });

    const averageRating = totalCount > 0 ? totalRating / totalCount : 0;

    return NextResponse.json(
      { feedback, averageRating, ratingDistribution, totalCount },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/club-admin/events/[id]/feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
