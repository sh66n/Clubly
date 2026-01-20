import React from "react";

export default function Loading() {
  return (
    <div className="h-full w-full animate-pulse">
      {/* 1. Panorama Skeleton (Negative margin to match your Panorama component) */}
      <div className="bg-gray-800 h-[13rem] -m-10 mb-0" />

      {/* 2. Club Logo Skeleton (Overlapping/Floating) */}
      <div className="relative w-30 h-30 -mt-15 mb-4 rounded-full border border-white/5 bg-gray-800" />

      {/* 3. Club Header Skeleton */}
      <div className="flex flex-col gap-4 mt-6">
        <div className="flex justify-between items-start">
          {/* Full Name */}
          <div className="h-10 w-1/3 bg-gray-800 rounded-lg" />
          {/* Short Name/Badge */}
          <div className="h-8 w-20 bg-gray-800 rounded-full" />
        </div>

        {/* Department Info */}
        <div className="h-5 w-1/4 bg-gray-800/60 rounded-md" />

        {/* Stats Row */}
        <div className="flex gap-6 w-1/4 mt-2">
          <div className="h-4 w-16 bg-gray-800/40 rounded" />
          <div className="h-4 w-16 bg-gray-800/40 rounded" />
        </div>
      </div>

      {/* 4. Event Grid Sections */}
      <div className="mt-12 space-y-12">
        {/* Upcoming Section */}
        <section>
          <div className="h-8 w-32 bg-gray-800 rounded-lg mb-6" />
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 w-full bg-gray-800 rounded-2xl border border-white/5"
              />
            ))}
          </div>
        </section>

        {/* Completed Section (Subtle/Dimmer) */}
        <section>
          <div className="h-8 w-32 bg-gray-800/50 rounded-lg mb-6" />
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-64 w-full bg-gray-800/40 rounded-2xl border border-white/5"
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
