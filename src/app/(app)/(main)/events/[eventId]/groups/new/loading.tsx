import BackButton from "@/components/BackButton";
import React from "react";

export default function Loading() {
  return (
    <div className="w-full">
      {/* Back Button Skeleton */}
      <BackButton />

      <div className="max-w-lg">
        {/* Header Section */}
        <div className="mb-8 mt-4 space-y-3">
          <div className="h-9 w-48 bg-gray-800 animate-pulse rounded-md" />
          <div className="h-4 w-64 bg-gray-800 animate-pulse rounded-md" />
        </div>

        <div className="space-y-6">
          {/* Group Name Input Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-24 bg-gray-800 animate-pulse rounded-md ml-1" />
            <div className="h-12 w-full bg-gray-800 animate-pulse rounded-xl" />
          </div>

          {/* Visibility Toggle Skeleton */}
          <div className="space-y-2">
            <div className="h-4 w-20 bg-gray-800 animate-pulse rounded-md ml-1" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-12 bg-gray-800 animate-pulse rounded-xl" />
              <div className="h-12 bg-gray-800 animate-pulse rounded-xl" />
            </div>
            <div className="h-3 w-56 bg-gray-800 animate-pulse rounded-md ml-1 mt-1" />
          </div>

          {/* Submit Button Skeleton */}
          <div className="h-12 w-full mt-4 bg-gray-800 animate-pulse rounded-xl" />
        </div>
      </div>
    </div>
  );
}
