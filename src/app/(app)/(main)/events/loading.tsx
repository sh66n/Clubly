import EventCardSkeleton from "@/components/Events/EventSkeleton";
import SearchBar from "@/components/Events/SearchBar";
import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <h1 className="text-5xl font-semibold">Events</h1>

      <div className="my-2 text-[#717171]">
        Explore club activities and upcoming opportunities.
      </div>

      <SearchBar clubs={[]} />

      <div className="flex gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="bg-gray-800 rounded-full h-8 w-24 animate-pulse"
          />
        ))}
      </div>

      <div className="mt-8">
        <div className="flex justify-center">
          <div
            className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
                py-6 px-2 w-full md:w-auto"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
