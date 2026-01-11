import ClubCardSkeleton from "@/components/Clubs/ClubCardSkeleton";
import React from "react";

export default function loading() {
  return (
    <div className="flex flex-col min-h-full">
      <h1 className="text-5xl font-semibold">Clubs</h1>
      <div className="my-2 text-[#717171]">
        Explore club activities and upcoming opportunities.
      </div>
      <div className="grow mt-8">
        <div className="flex justify-center">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ClubCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
