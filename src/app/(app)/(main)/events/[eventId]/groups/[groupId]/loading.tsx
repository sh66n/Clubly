import React from "react";

export default function Loading() {
  return (
    <div className="max-w-6xl animate-pulse">
      {/* 1. Navigation Back Button Skeleton */}
      <div className="h-10 w-24 bg-gray-800 rounded-lg mb-6" />

      {/* 2. Responsive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
        {/* Main Content Skeleton */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            {/* Tag/Badge Skeleton */}
            <div className="h-6 w-28 bg-gray-800 rounded-full mb-4" />

            {/* Title Skeleton (Large) */}
            <div className="space-y-3 mb-6">
              <div className="h-12 w-3/4 bg-gray-800 rounded-xl" />
            </div>

            {/* Capacity Info Skeleton */}
            <div className="h-5 w-40 bg-gray-800 rounded-md" />
          </section>

          {/* Join Form Skeleton */}
          <div className="max-w-md h-[120px] bg-gray-800 rounded-2xl border border-white/5" />
        </div>

        {/* Sidebar Skeleton */}
        <aside className="space-y-6">
          <div>
            {/* Section Header Skeleton */}
            <div className="h-4 w-32 bg-gray-800 rounded mb-4" />

            {/* Member Card Skeletons */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-[60px] w-full bg-gray-800 rounded-xl border border-white/5"
                />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
