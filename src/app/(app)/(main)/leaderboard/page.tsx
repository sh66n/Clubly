import Leaderboard from "@/components/Leaderboard/Leaderboard";
import { connectToDb } from "@/lib/connectToDb";
import { UserPoints } from "@/models/userpoints.model";
import mongoose from "mongoose";
import React from "react";

const getLbRankings = async (clubId: string) => {
  try {
    await connectToDb();
    if (!mongoose.Types.ObjectId.isValid(clubId)) return [];

    const topParticipants = await UserPoints.find({
      clubId: new mongoose.Types.ObjectId(clubId),
    })
      .sort({ points: -1 })
      .limit(5)
      .populate("userId", "name image")
      .lean();

    return topParticipants.map((up) => ({
      _id: (up.userId as any)?._id?.toString(),
      name: (up.userId as any)?.name,
      image: (up.userId as any)?.image,
      points: up.points,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const clubId = (await searchParams)?.clubId || "68ab3c6d14766aa80db61482";
  const topUsers = await getLbRankings(clubId);

  return (
    <div className="grow ">
      <Leaderboard topUsers={topUsers} />
    </div>
  );
}
