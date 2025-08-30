import Leaderboard from "@/components/Leaderboard/Leaderboard";
import axios from "axios";
import React from "react";

const getLbRankings = async (clubId) => {
  try {
    const { data } = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/leaderboard?clubId=${clubId}&limit=10`
    );
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const clubId = (await searchParams)?.clubId || "68ab3c6d14766aa80db61482";
  const data = await getLbRankings(clubId);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-5xl font-semibold">Leaderboard</h1>
      <div className="mt-2 text-[#717171]">
        Your efforts, ranked and recognized.
      </div>
      <div className="grow">
        <Leaderboard topUsers={data.topParticipants} />
      </div>
    </div>
  );
}
