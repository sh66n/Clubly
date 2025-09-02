import BorderedDiv from "@/components/BorderedDiv";
import React from "react";

export default function loading() {
  return (
    <div className="h-full flex flex-col">
      <h1 className="text-5xl font-semibold">Dashboard</h1>
      <div className="mt-2 text-[#717171]">
        Track, explore, and make the most of your club journey.
      </div>
      <div className="flex flex-col grow">
        <div className="my-4 flex gap-4">
          <BorderedDiv className="flex-1 h-40 flex flex-col">
            <div className="text-2xl font-semibold mb-2">Events attended</div>
            <div className="bg-gray-900 flex-[50%] mb-1 animate-pulse rounded-lg"></div>
            <div className="bg-gray-900 flex-[25%] animate-pulse rounded-lg"></div>
          </BorderedDiv>
          <BorderedDiv className="flex-1 h-40 flex flex-col">
            <div className="text-2xl font-semibold mb-2">Leaderboard</div>
            <div className="bg-gray-900 flex-[50%] mb-1 animate-pulse rounded-lg"></div>
            <div className="bg-gray-900 flex-[25%] animate-pulse rounded-lg"></div>
          </BorderedDiv>
          <BorderedDiv className="flex-1 h-40 flex flex-col">
            <div className="text-2xl font-semibold mb-2">Applied Events</div>
            <div className="bg-gray-900 flex-[50%] mb-1 animate-pulse rounded-lg"></div>
            <div className="bg-gray-900 flex-[25%] animate-pulse rounded-lg"></div>
          </BorderedDiv>
        </div>

        <div className="grow flex gap-4">
          <BorderedDiv className="flex-1 flex flex-col">
            <div className="text-2xl font-semibold mb-2">Events this week</div>
            <div className="text-xs text-[#717171] mb-2">
              Keep an eye out for upcoming ones.
            </div>
            <div className="grow bg-gray-900 animate-pulse rounded-lg"></div>
          </BorderedDiv>

          <BorderedDiv className="flex-1 flex flex-col">
            <div className="text-2xl font-semibold mb-2">Explore Clubs</div>
            <div className="text-xs text-[#717171] mb-2">
              Clubs you might be interested in
            </div>
            <div className="grow flex justify-evenly items-center">
              <div className="flex flex-col p-2 rounded-lg">
                <div className="h-30 w-30 bg-gray-900 animate-pulse rounded-lg"></div>
                <div className="text-center mt-2 bg-gray-900 animate-pulse rounded-lg h-4"></div>
              </div>

              <div className="flex flex-col p-2 rounded-lg">
                <div className="h-30 w-30 bg-gray-900 animate-pulse rounded-lg"></div>
                <div className="text-center mt-2 bg-gray-900 animate-pulse rounded-lg h-4"></div>
              </div>

              <div className="flex flex-col p-2 rounded-lg">
                <div className="h-30 w-30 bg-gray-900 animate-pulse rounded-lg"></div>
                <div className="text-center mt-2 bg-gray-900 animate-pulse rounded-lg h-4"></div>
              </div>

              <div className="flex flex-col p-2 rounded-lg">
                <div className="h-30 w-30 bg-gray-900 animate-pulse rounded-lg"></div>
                <div className="text-center mt-2 bg-gray-900 animate-pulse rounded-lg h-4"></div>
              </div>
            </div>
          </BorderedDiv>
        </div>
      </div>
    </div>
  );
}
