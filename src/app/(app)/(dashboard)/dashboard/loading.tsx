import BorderedDiv from "@/components/BorderedDiv";
import React from "react";

export default function loading() {
  return (
    <div className="h-full flex flex-col">
      {/* Header Section */}
      <div className="mb-4">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold">
          Dashboard
        </h1>
        <div className="mt-2 text-[#717171]">
          Track, explore, and make the most of your club journey.
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col grow">
        {/* Stats Cards Row */}
        <div className="my-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <BorderedDiv className="w-full flex flex-col">
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
              Events attended
            </div>
            <div className="bg-gray-900 h-12 sm:h-14 lg:h-16 mb-2 animate-pulse rounded-lg"></div>
            <div className="bg-gray-900 h-3 w-3/4 animate-pulse rounded-lg"></div>
          </BorderedDiv>

          <BorderedDiv className="w-full flex flex-col">
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
              Leaderboard
            </div>
            <div className="bg-gray-900 h-12 sm:h-14 lg:h-16 mb-2 animate-pulse rounded-lg"></div>
            <div className="bg-gray-900 h-3 w-2/3 animate-pulse rounded-lg"></div>
          </BorderedDiv>

          <BorderedDiv className="w-full sm:col-span-2 lg:col-span-1 flex flex-col">
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
              Applied Events
            </div>
            <div className="bg-gray-900 h-12 sm:h-14 lg:h-16 mb-2 animate-pulse rounded-lg"></div>
            <div className="bg-gray-900 h-3 w-3/4 animate-pulse rounded-lg"></div>
          </BorderedDiv>
        </div>

        {/* Charts and Clubs Row */}
        <div className="grow grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Events Chart */}
          <BorderedDiv className="flex flex-col">
            <div className="text-lg sm:text-xl lg:text-2xl font-semibold mb-2">
              Events this week
            </div>
            <div className="text-xs text-[#717171] mb-2">
              Keep an eye out for upcoming ones.
            </div>
            <div className="flex-1 min-h-[200px] bg-gray-900 animate-pulse rounded-lg"></div>
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
                {[1, 2, 3, 4].map((index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center p-2 rounded-lg"
                  >
                    <div className="h-20 w-20 sm:h-24 sm:w-24 bg-gray-900 animate-pulse rounded-lg mb-2"></div>
                    <div className="bg-gray-900 h-4 w-16 sm:w-20 animate-pulse rounded-lg"></div>
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
