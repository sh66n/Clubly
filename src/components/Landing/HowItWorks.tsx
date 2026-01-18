import React from "react";
import { Number, Working, WorkingCard } from "./WorkingCard";

export default function HowItWorks() {
  return (
    <div
      id="howitworks"
      className="min-h-screen flex justify-center items-center font-light"
    >
      <div className="flex flex-col mb-32 items-center justify-center">
        <div className="heading text-[#5E77F5] text-xs md:text-base">
          {"{ How It Works }"}
        </div>
        <div className="xs:text-xl sm:text-2xl md:text-3xl xl:text-4xl mt-2">
          How Clubly Works{" "}
        </div>
        <div className="text-[#717171] mt-1 text-center mb-12 text-xs md:text-base">
          Three easy steps to set up, engage, and grow your college club
          community.
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <WorkingCard>
            <Number>{"{ 1 }"}</Number>
            <Working>Create your club space</Working>
          </WorkingCard>

          <WorkingCard>
            <Number>{"{ 2 }"}</Number>
            <Working>Add members and events</Working>
          </WorkingCard>

          <WorkingCard>
            <Number>{"{ 3 }"}</Number>
            <Working>Track, reward, and grow engagement</Working>
          </WorkingCard>
        </div>
      </div>
    </div>
  );
}
