import EventCardSkeleton from "@/components/Events/EventSkeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-full">
      <h1 className="text-5xl font-semibold">Events</h1>
      <div className="my-2 text-[#717171]">
        Explore club activities and upcoming opportunities.
      </div>
      <div className="grow mt-8">
        <div className="flex justify-center">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 p-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
