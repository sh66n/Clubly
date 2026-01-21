import BackButton from "@/components/BackButton";
import React from "react";

export default function Loading() {
  return (
    <>
      <BackButton />
      <div className="flex flex-col">
        <div className="text-3xl">Attendance</div>
        <div className="mb-8 text-[#717171]">
          Record attendance for participants{" "}
        </div>
        <div className="max-w-xl mx-auto w-full px-6 py-12 space-y-16">
          {/* Skeleton: Present List */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 animate-pulse">
              <div className="h-2 w-16 bg-zinc-800 rounded" />
              <div className="h-[1px] grow bg-zinc-900" />
              <div className="h-2 w-4 bg-zinc-900 rounded" />
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between animate-pulse"
                >
                  <div className="flex-1 flex gap-2 items-center">
                    <div className="h-8 w-8 rounded-full bg-zinc-800" />
                    <div className="h-4 w-32 bg-zinc-800 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-zinc-900 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton: Absent List */}
          <div className="space-y-8">
            <div className="flex items-center gap-4 animate-pulse">
              <div className="h-2 w-16 bg-zinc-900 rounded" />
              <div className="h-[1px] grow bg-zinc-900" />
              <div className="h-2 w-4 bg-zinc-900 rounded" />
            </div>

            <div className="space-y-4 opacity-50">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between animate-pulse"
                >
                  <div className="flex-1 flex gap-2 items-center">
                    <div className="h-8 w-8 rounded-full bg-zinc-900" />
                    <div className="h-4 w-24 bg-zinc-900 rounded" />
                  </div>
                  <div className="h-8 w-20 bg-zinc-900 rounded-md" />
                </div>
              ))}
            </div>
          </div>

          {/* Skeleton: Button */}
          <div className="pt-10 flex justify-center animate-pulse">
            <div className="h-4 w-32 bg-zinc-800 rounded shadow-sm" />
          </div>
        </div>
      </div>
    </>
  );
}
