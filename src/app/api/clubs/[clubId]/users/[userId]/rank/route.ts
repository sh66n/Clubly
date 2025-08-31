import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ clubId: string; userId: string }> }
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

    // Get user rank in this club
    const result = await User.aggregate([
      { $unwind: "$points" },
      { $match: { "points.clubId": clubObjectId } },
      {
        $setWindowFields: {
          sortBy: { "points.points": -1 },
          output: { rank: { $rank: {} } },
        },
      },
      { $match: { _id: userObjectId } },
      {
        $project: {
          _id: 1,
          rank: 1,
          points: "$points.points",
        },
      },
    ]);

    if (!result.length) {
      return NextResponse.json(
        { message: "User not found in this club" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...result[0],
      totalUsers,
    });
  } catch (error) {
    return NextResponse.json({ message: "error", error }, { status: 500 });
  }
};
