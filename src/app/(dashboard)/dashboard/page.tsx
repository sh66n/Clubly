import { auth } from "@/auth";
import BorderedDiv from "@/components/BorderedDiv";
import { getEventsAttendedByUser } from "@/services/getEventsAttendedByUser";
import { getEventsRegisteredByUser } from "@/services/getEventsRegisteredByUser";
import { getLeaderboardRank } from "@/services/getLeaderboardRank";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

const getInsights = async (userId) => {
  const eventsAttended = await getEventsAttendedByUser(userId);
  const leaderboardData = await getLeaderboardRank(
    "68ab3c6d14766aa80db61482",
    userId
  );
  const eventsRegistered = await getEventsRegisteredByUser(userId);
  return { eventsAttended, leaderboardData, eventsRegistered };
};

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { eventsAttended, leaderboardData, eventsRegistered } =
    await getInsights(session?.user?.id);

  return (
    <div>
      <h1 className="text-5xl font-semibold">Dashboard</h1>
      <div className="mt-2 text-[#717171]">
        Track, explore, and make the most of your club journey.
      </div>
      <div className="mt-4 flex gap-4">
        <BorderedDiv className="flex-1">
          <div className="text-2xl font-semibold">Events attended</div>
          <div className="text-[#5E77F5] font-bold text-5xl my-4">
            {eventsAttended}
          </div>
          <div className="text-xs text-[#717171]">increase from last month</div>
        </BorderedDiv>

        <BorderedDiv className="flex-1">
          <div className="text-2xl font-semibold">Leaderboard</div>
          <div className="text-[#5E77F5] font-bold text-5xl my-4">
            #{leaderboardData.rank}
          </div>
          <div className="text-xs text-[#717171]">
            out of {leaderboardData.totalUsers} users
          </div>
        </BorderedDiv>

        <BorderedDiv className="flex-1">
          <div className="text-2xl font-semibold">Applied Events</div>
          <div className="text-[#5E77F5] font-bold text-5xl my-4">
            {eventsRegistered}
          </div>
          <div className="text-xs text-[#717171]">increase from last month</div>
        </BorderedDiv>
      </div>
    </div>
  );
}
