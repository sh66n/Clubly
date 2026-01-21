import BackButton from "@/components/BackButton";
import React from "react";

export default function Loading() {
  return (
    <>
      <BackButton />
      <h1 className="text-3xl font-semibold mb-2">Assign Winner</h1>
      <div className="mb-8 text-[#717171]">
        Select and confirm the winner for this event
      </div>

      <div className="max-w-xl mx-auto w-full px-6 py-12 space-y-16">
        {/* Skeleton: Current Champion */}
        <div className="space-y-6">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="h-3 w-3 rounded bg-amber-500/20" />
            <div className="h-2 w-24 bg-zinc-800 rounded" />
            <div className="h-[1px] grow bg-zinc-900" />
          </div>

          <div className="relative animate-pulse">
            {/* Mimicking the GroupCard/UserCard height */}
            <div className="h-16 w-full bg-zinc-800/50 rounded-xl border border-zinc-800" />
          </div>
        </div>

        {/* Skeleton: Participants List */}
        <div className="space-y-8">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="h-3 w-3 rounded bg-zinc-800" />
            <div className="h-2 w-20 bg-zinc-900 rounded" />
            <div className="h-[1px] grow bg-zinc-900/50" />
          </div>

          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex gap-3 items-center">
                    <div className="h-8 w-8 rounded-full bg-zinc-900" />
                    <div className="h-3 w-32 bg-zinc-900 rounded" />
                  </div>
                  {/* Mimicking the minimalist text button */}
                  <div className="h-2 w-16 bg-zinc-900 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
