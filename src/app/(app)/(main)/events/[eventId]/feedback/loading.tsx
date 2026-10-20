import React from "react";
import BorderedDiv from "@/components/BorderedDiv";

export default function Loading() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 animate-pulse">
      {/* Back button placeholder */}
      <div className="inline-flex items-center gap-2 mb-6">
        <div className="w-24 h-4 bg-zinc-800 rounded" />
      </div>

      {/* Header section skeleton */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800" />
          <div className="space-y-1.5">
            <div className="w-32 h-4 bg-zinc-800 rounded" />
            <div className="w-20 h-3 bg-zinc-900 rounded" />
          </div>
        </div>
        <div className="w-64 h-8 bg-zinc-800 rounded mb-2" />
        <div className="w-96 h-4 bg-zinc-900 rounded" />
      </div>

      {/* Questions skeleton */}
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <BorderedDiv key={i} className="p-6 space-y-4">
            <div className="w-3/4 h-5 bg-zinc-800 rounded" />
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <div key={star} className="w-8 h-8 rounded-lg bg-zinc-800/80" />
              ))}
            </div>
          </BorderedDiv>
        ))}

        <div className="w-full h-12 rounded-xl bg-zinc-800" />
      </div>
    </div>
  );
}
