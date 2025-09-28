import React from "react";

export default function Forbidden() {
  return (
    <div className="relative min-h-screen h-full flex-grow pt-4 pr-4 pb-4">
      <div className="h-full rounded-lg p-10 pb-4 border border-[#515151] relative flex flex-col justify-center items-center">
        <div className="bg-[url(/images/403.png)] h-40 w-60 md:h-80 md:w-120 bg-contain bg-center bg-no-repeat"></div>
        <div className="text-lg">Access Forbidden</div>
        <div className="text-xs text-center">
          If you believe this is a mistake, please contact support.
        </div>
      </div>
    </div>
  );
}
