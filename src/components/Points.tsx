import React from "react";
interface PointsProps {
  points: Number | null;
}
export default function Points({ points }: PointsProps) {
  return (
    <div className="mt-4 flex-shrink-0 w-full">
      <div className="w-full relative pb-[100%] bg-[url('/images/myPoints.png')] bg-cover bg-center rounded-md">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
          <span className="text-2xl md:text-xl lg:text-2xl">My Points</span>
          <div className="mt-4 text-5xl md:text-4xl lg:text-6xl font-semibold">
            {points}
          </div>
        </div>
      </div>
    </div>
  );
}
