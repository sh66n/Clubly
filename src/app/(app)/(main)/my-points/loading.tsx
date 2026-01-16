import React from "react";

export default function Loading() {
  return (
    <div className="flex flex-col h-full w-full text-white">
      {/* Heading */}
      <h1 className="text-5xl font-semibold">My Points</h1>
      {/* Subheading */}
      <div className="my-2 text-[#717171]">
        Every event counts — see how far you&apos;ve come.
      </div>

      {/* Center Card */}
      <div className="grow flex items-center justify-center">
        <div className="w-80 h-80 bg-black rounded-xl shadow-md relative">
          {/* Inner placeholders */}
          <div className="flex-shrink-0 w-full">
            <div className="w-full relative pb-[100%] bg-[url('/images/myPoints.png')] bg-cover bg-center rounded-md">
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <span className="text-2xl md:text-xl lg:text-2xl">
                  My Points
                </span>
                <div className="mt-4 text-5xl md:text-4xl lg:text-6xl font-semibold animate-pulse">
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
