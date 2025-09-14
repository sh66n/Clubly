import React from "react";

export default function Podium({ topThree }) {
  return (
    <div className="h-[60%] flex justify-center">
      {/* 2nd place */}
      <div className="w-20 md:w-40">
        <div className="h-3/4 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <img
              className="h-3/4 w-3/4 rounded-full"
              src={topThree[1].image}
              alt={topThree[1].name}
            />
            <div className="mt-2 text-xs md:text-base text-center">
              {topThree[1].name}
            </div>
          </div>
        </div>
        <div className="h-1/4 bg-[#30429A] rounded-t-2xl text-xl md:text-3xl text-center py-2 md:py-4">
          #2
        </div>
      </div>

      {/* 1st place */}
      <div className="w-20 md:w-40">
        <div className="h-1/2 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <img
              className="h-3/4 w-3/4 rounded-full"
              src={topThree[0].image}
              alt={topThree[0].name}
            />
            <div className="mt-2 text-xs md:text-base text-center">
              {topThree[0].name}
            </div>
          </div>
        </div>
        <div className="h-1/2 bg-[#24306D] rounded-t-2xl text-xl md:text-3xl text-center py-2 md:py-4">
          #1
        </div>
      </div>

      {/* 3rd place */}
      <div className="w-20 md:w-40">
        <div className="h-7/8 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <img
              className="h-3/4 w-3/4 rounded-full"
              src={topThree[2].image}
              alt={topThree[2].name}
            />
            <div className="mt-2 text-xs md:text-base text-center">
              {topThree[2].name}
            </div>
          </div>
        </div>
        <div className="h-1/8 bg-[#5E77F5] rounded-t-2xl text-lg md:text-3xl text-center pt-1">
          #3
        </div>
      </div>
    </div>
  );
}
