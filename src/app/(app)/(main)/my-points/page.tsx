import { auth } from "@/auth";
import Points from "@/components/Points";
import React from "react";

export default async function MyPoints() {
  const session = await auth();

  return (
    <div className="flex flex-col h-full w-full">
      <h1 className="text-5xl font-semibold">My Points</h1>
      <div className="my-2 text-[#717171]">
        Every event counts — see how far you&apos;ve come.
      </div>
      <div className="grow flex items-center justify-center">
        <div className="w-80 h-80 flex items-center justify-center">
          <Points points={session?.user?.points} />
        </div>
      </div>
    </div>
  );
}
