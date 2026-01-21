import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, User, Group } from "@/models";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/events/:id/winners
export const PUT = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    await connectToDb();

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const event = await Event.findById(id);
    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    if (
      event.organizingClub.toString() !== session.user.adminClub?.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { winnerId } = await req.json(); // winnerId can be a user or group ID

    if (!winnerId || typeof winnerId !== "string") {
      return NextResponse.json(
        { error: "winnerId must be a valid ID" },
        { status: 400 },
      );
    }

    const winnerPoints = event.points?.winner ?? 50;
    const clubId = event.organizingClub;

    if (event.eventType === "individual") {
      // Deduct points from old winner
      if (event.winner && event.winner.toString() !== winnerId) {
        await awardPointsToUser(event.winner, clubId, -winnerPoints);
      }

      // Assign new winner
      event.winner = winnerId;
      event.winnerGroup = null;
      await event.save();

      // Award points
      await awardPointsToUser(winnerId, clubId, winnerPoints);
    } else if (event.eventType === "team") {
      const group = await Group.findById(winnerId).populate("members");
      if (!group || group.event.toString() !== event._id.toString()) {
        return NextResponse.json(
          { error: "Invalid winner group" },
          { status: 400 },
        );
      }

      // Deduct points from previous winner group if different
      if (event.winnerGroup && event.winnerGroup.toString() !== winnerId) {
        const oldGroup = await Group.findById(event.winnerGroup).populate(
          "members",
        );
        if (oldGroup) {
          for (const member of oldGroup.members) {
            await awardPointsToUser(member._id, clubId, -winnerPoints);
          }
        }
      }

      // Assign new winner group
      event.winnerGroup = group._id;
      event.winner = null;
      await event.save();

      // Award points to new winner group
      for (const member of group.members) {
        await awardPointsToUser(member._id, clubId, winnerPoints);
      }
    }

    return NextResponse.json(
      {
        message: `Winner assigned and points updated (+/-${winnerPoints})`,
        event,
      },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error assigning winners:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};

// Helper to award points (+/-)
async function awardPointsToUser(userId: string, clubId: any, points: number) {
  const user = await User.findById(userId);
  if (!user) return;

  const existing = user.points.find(
    (p) => p.clubId.toString() === clubId.toString(),
  );
  if (existing) {
    await User.updateOne(
      { _id: userId, "points.clubId": clubId },
      { $inc: { "points.$.points": points } },
    );
  } else if (points > 0) {
    // Only push if awarding positive points
    await User.updateOne(
      { _id: userId },
      { $push: { points: { clubId, points } } },
    );
  }
}
