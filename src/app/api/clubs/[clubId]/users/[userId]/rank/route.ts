import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; userId: string }> },
) => {
  try {
    await connectToDb();
    const { clubId, userId } = await params;
    const clubObjectId = new mongoose.Types.ObjectId(clubId);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Count total users who have points for this club
    const totalUsers = await User.countDocuments({
      "points.clubId": clubObjectId,
    });

    // Aggregate to get rank
    const rankedUsers = await User.aggregate([
      { $unwind: "$points" },
      { $match: { "points.clubId": clubObjectId } },
      {
        $setWindowFields: {
          sortBy: { "points.points": -1 },
          output: { rank: { $rank: {} } },
        },
      },
      {
        $project: {
          _id: 1,
          points: "$points.points",
          rank: 1,
        },
      },
    ]);

    // Find this specific user
    const userRankData = rankedUsers.find((u) => u._id.equals(userObjectId));

    // If user has no points for this club, rank = -1
    if (!userRankData) {
      const user = await User.findById(userObjectId);
      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 },
        );
      }
      return NextResponse.json({
        _id: user._id,
        points:
          user.points?.find((p) => p.clubId.equals(clubObjectId))?.points || 0,
        rank: -1,
        totalUsers,
      });
    }

    return NextResponse.json({
      ...userRankData,
      totalUsers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error", error }, { status: 500 });
  }
};
