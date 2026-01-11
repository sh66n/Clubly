import React from "react";

export default function PodiumSkeleton() {
  return (
    <div className="h-[60%] flex justify-center gap-4 animate-pulse">
      {/* 2nd place */}
      <div className="w-20 md:w-40">
        <div className="h-3/4 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <div className="h-3/4 w-3/4 rounded-full bg-gray-800" />
            <div className="mt-2 h-3 md:h-4 w-14 md:w-24 bg-gray-800 rounded" />
          </div>
        </div>
        <div className="h-1/4 bg-gray-800 rounded-t-2xl flex items-center justify-center">
          <div className="h-5 md:h-7 w-8 bg-gray-800 rounded" />
        </div>
      </div>

      {/* 1st place */}
      <div className="w-20 md:w-40">
        <div className="h-1/2 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <div className="h-3/4 w-3/4 rounded-full bg-gray-800" />
            <div className="mt-2 h-3 md:h-4 w-16 md:w-28 bg-gray-800 rounded" />
          </div>
        </div>
        <div className="h-1/2 bg-gray-800 rounded-t-2xl flex items-center justify-center">
          <div className="h-6 md:h-8 w-10 bg-gray-800 rounded" />
        </div>
      </div>

      {/* 3rd place */}
      <div className="w-20 md:w-40">
        <div className="h-7/8 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <div className="h-3/4 w-3/4 rounded-full bg-gray-800" />
            <div className="mt-2 h-3 md:h-4 w-12 md:w-20 bg-gray-800 rounded" />
          </div>
        </div>
        <div className="h-1/8 bg-gray-800 rounded-t-2xl flex items-center justify-center">
          <div className="h-4 md:h-6 w-8 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}
