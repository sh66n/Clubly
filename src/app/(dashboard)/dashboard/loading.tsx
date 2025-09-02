import BorderedDiv from "@/components/BorderedDiv";
import React from "react";

export default function loading() {
  return (
    <div>
      <h1 className="text-5xl font-semibold">Dashboard</h1>
      <div className="mt-2 text-[#717171]">
        Track, explore, and make the most of your club journey.
      </div>
      <div className="mt-4 flex gap-4">
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
    </div>
  );
}
