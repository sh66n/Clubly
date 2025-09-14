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
      {/* Header Section */}
      <div className="mb-6 lg:mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-2">
          Dashboard
        </h1>
        <div className="text-sm sm:text-base text-[#717171]">
          Track, explore, and make the most of your club journey.
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col grow space-y-4 lg:space-y-6">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <BorderedDiv className="w-full">
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold">
              Events attended
            </div>
            <div className="text-[#5E77F5] font-bold text-3xl sm:text-4xl lg:text-5xl my-3 lg:my-4">
              {eventsAttended}
            </div>
            <div className="text-xs text-[#717171]">
              increase from last month
            </div>
          </BorderedDiv>

          <BorderedDiv className="w-full">
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold">
              Leaderboard
            </div>
            <div className="text-[#5E77F5] font-bold text-3xl sm:text-4xl lg:text-5xl my-3 lg:my-4">
              {leaderboardData.rank !== -1 ? `#${leaderboardData.rank}` : "N/A"}
            </div>
            <div className="text-xs text-[#717171]">
              out of {leaderboardData.totalUsers} users
            </div>
          </BorderedDiv>

          <BorderedDiv className="w-full sm:col-span-2 lg:col-span-1">
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold">
              Applied Events
            </div>
            <div className="text-[#5E77F5] font-bold text-3xl sm:text-4xl lg:text-5xl my-3 lg:my-4">
              {eventsRegistered}
            </div>
            <div className="text-xs text-[#717171]">
              increase from last month
            </div>
          </BorderedDiv>
        </div>

        {/* Charts and Clubs Row */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 flex-1">
          {/* Events Chart */}
          <BorderedDiv className="flex flex-col">
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
              Events this week
            </div>
            <div className="text-xs text-[#717171] mb-2">
              Keep an eye out for upcoming ones.
            </div>
            <BarChart upcomingEvents={upcomingEvents} />
          </BorderedDiv>

          {/* Clubs Section */}
          <BorderedDiv className="flex flex-col">
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
              Explore Clubs
            </div>
            <div className="text-xs text-[#717171] mb-2">
              Clubs you might be interested in
            </div>

            {/* Clubs Grid - Responsive Layout */}
            <div className="grow flex justify-evenly items-center">
              <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-4 w-full">
                {anyFourClubs.map((club, idx) => (
                  <div
                    key={club._id}
                    className="flex flex-col items-center p-2 rounded-lg"
                  >
                    <img
                      src={club.logo}
                      className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
                      alt={`${club.name} logo`}
                    />
                    <div className="text-center mt-2 text-sm sm:text-base">
                      {club.name}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </BorderedDiv>
        </div>
      </div>
    </div>
  );
}
