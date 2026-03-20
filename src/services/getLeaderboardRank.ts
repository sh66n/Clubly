import { connectToDb } from "@/lib/connectToDb";
import { UserPoints } from "@/models/userpoints.model";
import mongoose from "mongoose";

export async function getLeaderboardRank(clubId: string, userId: string) {
  if (
    !clubId ||
    !userId ||
    !mongoose.Types.ObjectId.isValid(clubId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    return { _id: userId, rank: -1, points: 0, totalUsers: 0 };
  }

  try {
    await connectToDb();
    const clubObjectId = new mongoose.Types.ObjectId(clubId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const [totalUsers, userPoints] = await Promise.all([
      UserPoints.countDocuments({ clubId: clubObjectId }),
      UserPoints.findOne({ userId: userObjectId, clubId: clubObjectId }),
    ]);

    if (!userPoints) {
      return { _id: userId, points: 0, rank: -1, totalUsers };
    }

    const usersWithMorePoints = await UserPoints.countDocuments({
      clubId: clubObjectId,
      points: { $gt: userPoints.points },
    });

    return {
      _id: userId,
      points: userPoints.points,
      rank: usersWithMorePoints + 1,
      totalUsers,
    };
  } catch (error) {
    console.error("Error fetching club rank:", error);
    return { _id: userId, rank: -1, points: 0, totalUsers: 0 };
  }
}
