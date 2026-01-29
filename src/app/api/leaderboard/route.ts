import { connectToDb } from "@/lib/connectToDb";
import { Club } from "@/models/club.model";
import { User } from "@/models/user.model";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    await connectToDb();
    const clubId = req.nextUrl.searchParams.get("clubId");
    const limitString = req.nextUrl.searchParams.get("limit");
    const limit = parseInt(limitString);

    const topParticipants = await User.aggregate([
      // Unwind the points array so each club points is a separate document
      { $unwind: "$points" },

      // Match only the specified clubId
      { $match: { "points.clubId": new mongoose.Types.ObjectId(clubId) } },

      // Project only the fields we need
      { $project: { _id: 1, name: 1, image: 1, points: "$points.points" } },

      // Sort by points descending
      { $sort: { points: -1 } },

      // Limit to top N users
      { $limit: limit },
    ]);

    return NextResponse.json({ topParticipants }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(error, { status: 500 });
  }
};
