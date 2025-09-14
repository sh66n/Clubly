import React from "react";

export default function PodiumSkeleton() {
  return (
    <div className="h-[60%] flex justify-center gap-4">
      {/* 2nd place */}
      <div>
        <div className="w-40 h-3/4 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <div className="h-3/4 w-3/4 rounded-full bg-gray-800 animate-pulse" />
            <div className="mt-2 w-20 h-3 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-40 h-1/4 bg-gray-800 rounded-t-2xl text-3xl text-center py-4 animate-pulse" />
      </div>

      {/* 1st place */}
      <div>
        <div className="w-40 h-1/2 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <div className="h-3/4 w-3/4 rounded-full bg-gray-800 animate-pulse" />
            <div className="mt-2 w-20 h-3 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-40 h-1/2 bg-gray-800 rounded-t-2xl text-3xl text-center py-4 animate-pulse" />
      </div>

      {/* 3rd place */}
      <div>
        <div className="w-40 h-7/8 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <div className="h-3/4 w-3/4 rounded-full bg-gray-800 animate-pulse" />
            <div className="mt-2 w-20 h-3 bg-gray-800 rounded animate-pulse" />
          </div>
        </div>
        <div className="w-40 h-1/8 bg-gray-800 rounded-t-2xl text-3xl text-center pt-1 animate-pulse" />
      </div>
    </div>
  );
}
