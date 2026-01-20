import BackButton from "@/components/BackButton";
import React from "react";

export default function Loading() {
  return (
    <>
      <BackButton link={"/events"} />
      <div className="w-full max-w-7xl mx-auto px-4 py-8">
        {/* --- Hero Skeleton --- */}
        <div className="relative h-[260px] sm:h-[320px] md:h-[450px] w-full rounded-3xl overflow-hidden mb-8 bg-gray-800 animate-pulse">
          <div className="absolute bottom-0 left-0 p-4 sm:p-6 md:p-10 w-full flex flex-col gap-4">
            {/* Title Placeholder */}
            <div className="h-10 md:h-16 bg-gray-700 rounded-lg w-3/4 md:w-1/2" />

            {/* Badges Placeholder */}
            <div className="hidden md:flex gap-3">
              <div className="h-10 w-40 bg-gray-700 rounded-full" />
              <div className="h-10 w-32 bg-gray-700 rounded-full" />
            </div>
          </div>
        </div>

        {/* --- Timeline Skeleton --- */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-8 w-32 bg-gray-800 rounded-md animate-pulse" />
          </div>

          <div className="relative ml-4 border-l-2 border-gray-800 pl-8 pb-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="mb-10 relative">
                {/* Timeline Dot */}
                <div className="absolute -left-[41px] mt-1.5 w-4 h-4 rounded-full bg-gray-800 border-4 border-black z-10 animate-pulse" />

                {/* Date/Time Placeholder */}
                <div className="flex gap-2 mb-2">
                  <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-800 rounded animate-pulse" />
                </div>

                {/* Card Placeholder */}
                <div className="h-24 w-full bg-gray-800/50 rounded-xl border border-gray-800 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* --- Section: Events Grid Skeleton --- */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-8 w-40 bg-gray-800 rounded-md animate-pulse" />
          </div>

          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-64 bg-gray-800 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* --- Rewards Skeleton --- */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-8 w-48 bg-gray-800 rounded-md animate-pulse" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex h-24 rounded-xl border border-gray-800 bg-gray-900/50 overflow-hidden animate-pulse"
              >
                <div className="w-24 sm:w-32 bg-gray-800" />
                <div className="flex-1 p-4 space-y-2">
                  <div className="h-4 w-3/4 bg-gray-800 rounded" />
                  <div className="h-3 w-1/2 bg-gray-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
