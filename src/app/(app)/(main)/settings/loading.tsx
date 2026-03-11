import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col min-h-full animate-pulse">
      {/* Page Header Skeleton */}
      <h1 className="text-5xl font-semibold">Your Settings</h1>
      <div className="mt-2 mb-6 text-[#717171]">
        Manage your profile and account preferences
      </div>

      {/* Form Layout Skeleton */}
      <div className="max-w-5xl mx-auto w-full py-12 px-6">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* LEFT COLUMN: Avatar Sidebar */}
          <aside className="lg:w-1/3 space-y-8">
            <div className="space-y-3">
              <div className="h-8 w-40 bg-zinc-800 rounded-md" />
              <div className="h-4 w-56 bg-zinc-900 rounded-md" />
            </div>
            {/* The Squircle Avatar Skeleton */}
            <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-3xl bg-zinc-900 border border-zinc-800" />
          </aside>

          {/* RIGHT COLUMN: Form Content */}
          <div className="flex-1 space-y-12">
            {/* Section 1 Skeleton */}
            <div className="space-y-6">
              <div className="h-4 w-32 bg-zinc-800 rounded pb-3 border-b border-white/5" />
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <div className="h-3 w-20 bg-zinc-900 rounded ml-1" />
                  <div className="h-12 w-full bg-zinc-900/40 border border-zinc-800 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-zinc-900 rounded ml-1" />
                    <div className="h-12 w-full bg-zinc-950/50 border border-zinc-900 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-16 bg-zinc-900 rounded ml-1" />
                    <div className="h-12 w-full bg-zinc-950/50 border border-zinc-900 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2 Skeleton */}
            <div className="space-y-6">
              <div className="h-4 w-32 bg-zinc-800 rounded pb-3 border-b border-white/5" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-zinc-900 rounded ml-1" />
                  <div className="h-12 w-full bg-zinc-900/40 border border-zinc-800 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-zinc-900 rounded ml-1" />
                  <div className="h-12 w-full bg-zinc-950/50 border border-zinc-900 rounded-xl" />
                </div>
              </div>
            </div>

            {/* Action Bar Skeleton */}
            <div className="pt-10 flex items-center justify-end gap-10">
              <div className="h-4 w-16 bg-zinc-900 rounded" />
              <div className="h-11 w-40 bg-zinc-800 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
