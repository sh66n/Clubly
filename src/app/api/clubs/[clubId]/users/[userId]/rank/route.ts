import { connectToDb } from "@/lib/connectToDb";
import { UserPoints } from "@/models/userpoints.model";
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
    const totalUsers = await UserPoints.countDocuments({
      clubId: clubObjectId,
    });

    // Get user's points for this club
    const userPoints = await UserPoints.findOne({
      userId: userObjectId,
      clubId: clubObjectId,
    });

    if (!userPoints) {
      // User has no points for this club
      return NextResponse.json({
        _id: userId,
        points: 0,
        rank: -1,
        totalUsers,
      });
    }

    // Calculate rank by counting how many users have more points
    const usersWithMorePoints = await UserPoints.countDocuments({
      clubId: clubObjectId,
      points: { $gt: userPoints.points },
    });

    const rank = usersWithMorePoints + 1;

    return NextResponse.json({
      _id: userId,
      points: userPoints.points,
      rank,
      totalUsers,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error", error }, { status: 500 });
  }
};
