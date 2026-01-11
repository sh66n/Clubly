import React from "react";

export default function ClubCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[#515151] bg-black shadow-sm p-6 text-center flex flex-col animate-pulse">
      {/* Logo */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <div className="w-20 h-20 rounded-full bg-gray-800 mx-auto" />
      </div>

      {/* Club Info */}
      <div className="h-4 w-3/4 bg-gray-700 rounded mx-auto mb-2" />
      <div className="h-3 w-1/2 bg-gray-700 rounded mx-auto mb-4" />

      {/* Stats */}
      <div className="grow flex justify-center items-end gap-4 mt-4 text-xs">
        <div className="h-3 w-10 bg-gray-700 rounded" />
        <div className="h-3 w-10 bg-gray-700 rounded" />
        <div className="h-3 w-10 bg-gray-700 rounded" />
      </div>
    </div>
  );
}
