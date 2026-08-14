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

    const feedback = await Feedback.find({ eventId: id })
      .populate("userId", "name email image department")
      .populate("feedbackFormId", "name questions")
      .sort({ createdAt: -1 })
      .lean();

    const totalCount = feedback.length;
    let totalRating = 0;
    const ratingDistribution: Record<number, number> = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    };

    const perQuestionStats: Record<string, { total: number, count: number, dist: Record<number, number> }> = {};

    feedback.forEach((f: any) => {
      // Legacy or overall average logic
      if (f.rating) {
        totalRating += f.rating;
        if (f.rating >= 1 && f.rating <= 5) {
          ratingDistribution[f.rating] = (ratingDistribution[f.rating] || 0) + 1;
        }
      } else if (f.answers && f.answers.length > 0) {
        let avgRating = 0;
        f.answers.forEach((ans: any) => {
          avgRating += ans.rating;
          if (!perQuestionStats[ans.questionId]) {
            perQuestionStats[ans.questionId] = { total: 0, count: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
          }
          perQuestionStats[ans.questionId].total += ans.rating;
          perQuestionStats[ans.questionId].count += 1;
          if (ans.rating >= 1 && ans.rating <= 5) {
            perQuestionStats[ans.questionId].dist[ans.rating] += 1;
          }
        });
        avgRating = avgRating / f.answers.length;
        totalRating += avgRating;
        const rounded = Math.round(avgRating);
        if (rounded >= 1 && rounded <= 5) {
          ratingDistribution[rounded] = (ratingDistribution[rounded] || 0) + 1;
        }
      }
    });

    const averageRating = totalCount > 0 ? totalRating / totalCount : 0;
    
    // Format question stats
    const questionStats = Object.keys(perQuestionStats).map(qId => ({
      questionId: qId,
      average: perQuestionStats[qId].count > 0 ? perQuestionStats[qId].total / perQuestionStats[qId].count : 0,
      distribution: perQuestionStats[qId].dist
    }));

    return NextResponse.json(
      { feedback, averageRating, ratingDistribution, totalCount, questionStats },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("GET /api/club-admin/events/[id]/feedback error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
