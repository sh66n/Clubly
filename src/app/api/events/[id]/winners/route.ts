import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group, UserPoints, Badge } from "@/models";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

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

    const { winnerId, position = 1 } = await req.json(); // winnerId can be a user or group ID

    if (!winnerId || typeof winnerId !== "string") {
      return NextResponse.json(
        { error: "winnerId must be a valid ID" },
        { status: 400 },
      );
    }

    if (position < 1 || position > (event.numberOfWinners || 1)) {
      return NextResponse.json({ error: "Invalid position" }, { status: 400 });
    }

    let winnerPoints = event.points?.winner ?? 50;
    if (position === 2) winnerPoints = event.points?.second ?? 40;
    if (position === 3) winnerPoints = event.points?.third ?? 30;

    const clubId = event.organizingClub;
    const badgeType = `winner_${position}`;

    if (event.eventType === "individual") {
      // Find old winner at this position
      const oldWinnerObj = event.winners?.find((w: any) => w.position === position);
      let oldWinnerId = oldWinnerObj ? oldWinnerObj.user?.toString() : null;
      
      // Fallback to legacy field for position 1
      if (position === 1 && !oldWinnerId && event.winner) {
        oldWinnerId = event.winner.toString();
      }

      // Deduct points from old winner
      if (oldWinnerId && oldWinnerId !== winnerId) {
        await awardPointsToUser(oldWinnerId, clubId, -winnerPoints);
        // Downgrade old winner's badge back to participation
        await Badge.findOneAndUpdate(
          { userId: oldWinnerId, eventId: id },
          { type: "participation" },
        );
      }

      // Assign new winner
      const newWinners = (event.winners || []).filter((w: any) => w.position !== position);
      newWinners.push({ user: winnerId, position });

      const updatePayload: any = { $set: { winners: newWinners } };
      if (position === 1) {
        updatePayload.$set.winner = winnerId;
        updatePayload.$unset = { winnerGroup: "" };
      }

      await Event.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        updatePayload
      );

      // Award points
      await awardPointsToUser(winnerId, clubId, winnerPoints);

      // Award winner badge
      await Badge.findOneAndUpdate(
        { userId: winnerId, eventId: id },
        { type: badgeType },
        { upsert: true },
      );
    } else if (event.eventType === "team") {
      const group = await Group.findById(winnerId).populate("members");
      if (!group || group.event.toString() !== event._id.toString()) {
        return NextResponse.json(
          { error: "Invalid winner group" },
          { status: 400 },
        );
      }

      // Find old winner group at this position
      const oldWinnerObj = event.winners?.find((w: any) => w.position === position);
      let oldWinnerGroupId = oldWinnerObj ? oldWinnerObj.group?.toString() : null;
      
      // Fallback to legacy field for position 1
      if (position === 1 && !oldWinnerGroupId && event.winnerGroup) {
        oldWinnerGroupId = event.winnerGroup.toString();
      }

      // Deduct points from previous winner group if different
      if (oldWinnerGroupId && oldWinnerGroupId !== winnerId) {
        const oldGroup = await Group.findById(oldWinnerGroupId).populate(
          "members",
        );
        if (oldGroup) {
          for (const member of oldGroup.members) {
            await awardPointsToUser(member._id, clubId, -winnerPoints);
          }
          // Downgrade old winner group badges
          const downgradeOps = oldGroup.members.map((member: any) => ({
            updateOne: {
              filter: { userId: member._id, eventId: id },
              update: { $set: { type: "participation" } },
            },
          }));
          if (downgradeOps.length > 0) {
            await Badge.bulkWrite(downgradeOps);
          }
        }
      }

      // Assign new winner group
      const newWinners = (event.winners || []).filter((w: any) => w.position !== position);
      newWinners.push({ group: winnerId, position });

      const updatePayload: any = { $set: { winners: newWinners } };
      if (position === 1) {
        updatePayload.$set.winnerGroup = winnerId;
        updatePayload.$unset = { winner: "" };
      }

      await Event.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        updatePayload
      );

      // Award points to new winner group
      for (const member of group.members) {
        await awardPointsToUser(member._id, clubId, winnerPoints);
      }

      // Award winner badges to all group members
      const badgeOps = group.members.map((member: any) => ({
        updateOne: {
          filter: { userId: member._id, eventId: id },
          update: { $set: { type: badgeType } },
          upsert: true,
        },
      }));
      if (badgeOps.length > 0) {
        await Badge.bulkWrite(badgeOps);
      }
    }

    return NextResponse.json(
      {
        message: `Winner assigned for position ${position} and points updated (+/-${winnerPoints})`,
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

// DELETE /api/events/:id/winners?position=1
export const DELETE = async (
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

    const { searchParams } = new URL(req.url);
    const position = parseInt(searchParams.get("position") || "1", 10);

    let winnerPoints = event.points?.winner ?? 50;
    if (position === 2) winnerPoints = event.points?.second ?? 40;
    if (position === 3) winnerPoints = event.points?.third ?? 30;

    const clubId = event.organizingClub;

    if (event.eventType === "individual") {
      const oldWinnerObj = event.winners?.find((w: any) => w.position === position);
      let oldWinnerId = oldWinnerObj ? oldWinnerObj.user?.toString() : null;
      if (position === 1 && !oldWinnerId && event.winner) {
        oldWinnerId = event.winner.toString();
      }

      if (oldWinnerId) {
        await awardPointsToUser(oldWinnerId, clubId, -winnerPoints);
        await Badge.findOneAndUpdate(
          { userId: oldWinnerId, eventId: id },
          { type: "participation" },
        );
      }

      const newWinners = (event.winners || []).filter((w: any) => w.position !== position);
      const updatePayload: any = { $set: { winners: newWinners } };
      if (position === 1) {
        updatePayload.$unset = { winner: "", winnerGroup: "" };
      }

      await Event.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        updatePayload
      );
    } else if (event.eventType === "team") {
      const oldWinnerObj = event.winners?.find((w: any) => w.position === position);
      let oldWinnerGroupId = oldWinnerObj ? oldWinnerObj.group?.toString() : null;
      if (position === 1 && !oldWinnerGroupId && event.winnerGroup) {
        oldWinnerGroupId = event.winnerGroup.toString();
      }

      if (oldWinnerGroupId) {
        const oldGroup = await Group.findById(oldWinnerGroupId).populate("members");
        if (oldGroup) {
          for (const member of oldGroup.members) {
            await awardPointsToUser(member._id, clubId, -winnerPoints);
          }
          const downgradeOps = oldGroup.members.map((member: any) => ({
            updateOne: {
              filter: { userId: member._id, eventId: id },
              update: { $set: { type: "participation" } },
            },
          }));
          if (downgradeOps.length > 0) {
            await Badge.bulkWrite(downgradeOps);
          }
        }
      }

      const newWinners = (event.winners || []).filter((w: any) => w.position !== position);
      const updatePayload: any = { $set: { winners: newWinners } };
      if (position === 1) {
        updatePayload.$unset = { winner: "", winnerGroup: "" };
      }

      await Event.collection.updateOne(
        { _id: new mongoose.Types.ObjectId(id) },
        updatePayload
      );
    }

    return NextResponse.json(
      { message: `Winner unassigned from position ${position}` },
      { status: 200 },
    );
  } catch (error: any) {
    console.error("Error unassigning winner:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
};

// Helper to award points (+/-) using UserPoints collection
async function awardPointsToUser(userId: string, clubId: any, points: number) {
  await UserPoints.updateOne(
    { userId, clubId },
    [
      {
        $set: {
          userId,
          clubId,
          points: {
            $max: [
              0,
              {
                $add: [{ $ifNull: ["$points", 0] }, points],
              },
            ],
          },
        },
      },
    ],
    { upsert: true },
  );
}
