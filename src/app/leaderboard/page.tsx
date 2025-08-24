import Ranking from "@/components/Ranking";
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

export default async function Leaderboard({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const clubId = (await searchParams)?.clubId || "68ab3c6d14766aa80db61482";
  const data = await getLbRankings(clubId);

  return (
    <div className="relative h-screen flex-grow pt-4 pr-4 pb-4">
      <div className="h-full rounded-lg p-10 pb-4 border border-[#515151] relative bg-[url(/images/lb-bg.png)] bg-cover bg-top bg-no-repeat flex flex-col">
        <Ranking users={data.topParticipants} />
      </div>
    </div>
  );
}
