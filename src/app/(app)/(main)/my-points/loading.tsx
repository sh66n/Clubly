import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col h-full w-full animate-pulse text-white">
      {/* Heading */}
      <div className="h-12 w-48 bg-gray-800 rounded-md" />

      {/* Subheading */}
      <div className="mt-3 h-4 w-72 bg-gray-700 rounded-md" />

      {/* Center Card */}
      <div className="grow flex items-center justify-center">
        <div className="w-80 h-80 bg-black border border-[#515151] rounded-xl shadow-md relative">
          {/* Inner placeholders */}
          <div className="mt-4 flex-shrink-0 w-full">
            <div className="w-full relative pb-[100%] bg-[url('/images/myPoints.png')] bg-cover bg-center rounded-md">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-2xl md:text-xl lg:text-2xl">
                  My Points
                </span>
                <div className="mt-4 text-5xl md:text-4xl lg:text-6xl font-semibold">
                  <div className="h-6 w-24 bg-gray-700 rounded-md" />
                  <div className="h-16 w-32 bg-gray-700 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
