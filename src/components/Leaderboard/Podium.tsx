import React from "react";

export default function Podium({ topThree }) {
  return (
    <div className="h-[60%] flex justify-center">
      <div>
        <div className="w-40 h-3/4 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <img
              className={`h-3/4 w-3/4 rounded-full`}
              src={topThree[1].image}
            ></img>
            <div className="mt-2">{topThree[1].name}</div>
          </div>
        </div>
        <div className="w-40 h-1/4 bg-[#30429A] rounded-t-2xl text-3xl text-center py-4">
          <div className="">#2</div>
        </div>
      </div>
      <div>
        <div className="w-40 h-1/2 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <img
              className={`h-3/4 w-3/4 rounded-full`}
              src={topThree[0].image}
            ></img>
            <div className="mt-2">{topThree[0].name}</div>
          </div>
        </div>
        <div className="w-40 h-1/2 bg-[#24306D] rounded-t-2xl text-3xl text-center py-4">
          <div className="">#1</div>
        </div>
      </div>
      <div>
        <div className="w-40 h-7/8 flex flex-col justify-end">
          <div className="flex flex-col items-center aspect-square">
            <img
              className={`h-3/4 w-3/4 rounded-full`}
              src={topThree[2].image}
            ></img>
            <div className="mt-2">{topThree[2].name}</div>
          </div>
        </div>
        <div className="w-40 h-1/8 bg-[#5E77F5] rounded-t-2xl text-3xl text-center pt-1">
          <div className="">#3</div>
        </div>
      </div>
      <div></div>
      <div></div>
    </div>
  );
}
