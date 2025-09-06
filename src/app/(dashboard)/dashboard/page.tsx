import { auth } from "@/auth";
import BarChart from "@/components/BarChart";
import BorderedDiv from "@/components/BorderedDiv";
import { getAnyFourClubs } from "@/services/getAnyFourClubs";
import { getEventsAttendedByUser } from "@/services/getEventsAttendedByUser";
import { getEventsRegisteredByUser } from "@/services/getEventsRegisteredByUser";
import { getLeaderboardRank } from "@/services/getLeaderboardRank";
import { getWeeklyEventCounts } from "@/services/getWeeklyEventCounts";
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
  const upcomingEvents = await getWeeklyEventCounts();
  const anyFourClubs = await getAnyFourClubs();

  return {
    eventsAttended,
    leaderboardData,
    eventsRegistered,
    upcomingEvents,
    anyFourClubs,
  };
};

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const {
    eventsAttended,
    leaderboardData,
    eventsRegistered,
    upcomingEvents,
    anyFourClubs,
  } = await getInsights(session?.user?.id);

  return (
    <div className="h-full flex flex-col">
      <h1 className="text-5xl font-semibold">Dashboard</h1>
      <div className="mt-2 text-[#717171]">
        Track, explore, and make the most of your club journey.
      </div>
      <div className="flex flex-col grow">
        <div className="my-4 flex gap-4">
          <BorderedDiv className="flex-1">
            <div className="text-2xl font-semibold">Events attended</div>
            <div className="text-[#5E77F5] font-bold text-5xl my-4">
              {eventsAttended}
            </div>
            <div className="text-xs text-[#717171]">
              increase from last month
            </div>
          </BorderedDiv>

          <BorderedDiv className="flex-1">
            <div className="text-2xl font-semibold">Leaderboard</div>
            <div className="text-[#5E77F5] font-bold text-5xl my-4">
              {leaderboardData.rank !== -1 ? `#${leaderboardData.rank}` : "N/A"}
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
            <div className="text-xs text-[#717171]">
              increase from last month
            </div>
          </BorderedDiv>
        </div>
        <div className="grow flex gap-4">
          <BorderedDiv className="flex-1 flex flex-col">
            <div className="text-2xl font-semibold mb-2">Events this week</div>
            <div className="text-xs text-[#717171] mb-2">
              Keep an eye out for upcoming ones.
            </div>
            <BarChart upcomingEvents={upcomingEvents} />
          </BorderedDiv>

          <BorderedDiv className="flex-1 flex flex-col">
            <div className="text-2xl font-semibold mb-2">Explore Clubs</div>
            <div className="text-xs text-[#717171] mb-2">
              Clubs you might be interested in
            </div>
            <div className="grow flex justify-evenly items-center">
              {anyFourClubs.map((club, idx) => (
                <div key={club._id} className="flex flex-col p-2 rounded-lg">
                  <img src={club.logo} className="h-30 w-30" alt="" />
                  <div className="text-center mt-2">{club.name}</div>
                </div>
              ))}
            </div>
          </BorderedDiv>
        </div>
      </div>
    </div>
  );
}
