import React from "react";

export default function Diversity() {
  return (
    <div className="min-h-screen flex justify-center items-center font-light">
      <div className="flex flex-col mb-32 items-center justify-center">
        <div className="heading text-[#5E77F5] text-xs md:text-base">
          {"{ Diversity }"}
        </div>
        <div className="xs:text-xl sm:text-2xl md:text-3xl xl:text-4xl mt-2">
          Built for <span className="text-[#3B5CFF] italic mr-2">All</span>{" "}
          Types of Clubs
        </div>
        <div className="text-[#717171] mt-1 text-center text-xs md:text-base">
          Plan, manage, and grow your club with tools built for real engagement.
        </div>
      </div>
    </div>
  );
}
