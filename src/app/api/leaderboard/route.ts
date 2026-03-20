import { connectToDb } from "@/lib/connectToDb";
import { UserPoints } from "@/models/userpoints.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDb();
    const clubId = req.nextUrl.searchParams.get("clubId");
    const limitString = req.nextUrl.searchParams.get("limit");
    const limit = parseInt(limitString || "10");

    if (!clubId) {
      return NextResponse.json(
        { error: "clubId is required" },
        { status: 400 },
      );
    }

    // Query UserPoints collection directly (much simpler than aggregating User.points[])
    const topParticipants = await UserPoints.find({
      clubId: new mongoose.Types.ObjectId(clubId),
    })
      .sort({ points: -1 })
      .limit(limit)
      .populate("userId", "name image");

    // Transform to expected format
    const result = topParticipants.map((up) => ({
      _id: (up.userId as any)?._id,
      name: (up.userId as any)?.name,
      image: (up.userId as any)?.image,
      points: up.points,
    }));

    return NextResponse.json({ topParticipants: result }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
};
