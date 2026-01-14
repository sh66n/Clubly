import React from "react";

export default function EventCardSkeleton() {
  return (
    <div className="bg-black text-white rounded-xl overflow-hidden shadow-md w-full md:w-55 border border-[#515151] mb-2 flex flex-col animate-pulse">
      {/* Image Section */}
      <div className="relative">
        <div className="w-full h-40 bg-gray-800" />
        <div className="absolute top-2 right-2 h-5 w-16 bg-gray-700 rounded-full" />
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col gap-2 grow">
        {/* Title + Tag */}
        <div className="flex justify-between items-center">
          <div className="h-4 w-24 bg-gray-700 rounded" />
          <div className="h-4 w-16 bg-gray-700 rounded-full" />
        </div>

        {/* Date + Room */}
        <div className="flex justify-between items-center mt-2">
          <div className="h-3 w-28 bg-gray-700 rounded" />
          <div className="h-3 w-12 bg-gray-700 rounded" />
        </div>

        {/* Participants */}
        <div className="flex items-center gap-1 mt-auto">
          <div className="h-4 w-4 bg-gray-700 rounded" />
          <div className="h-3 w-6 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  );
}
