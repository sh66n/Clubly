import { EventCard } from "@/components/EventCard";
import React from "react";

const getAllEvents = () => {};

export default function Events() {
  return (
    <div className="relative min-h-screen h-full flex-grow pt-4 pr-4 pb-4">
      <div className="h-full rounded-lg p-10 pb-4 border border-[#515151] relative bg-[url(/images/lb-bg.png)] bg-cover bg-top bg-no-repeat">
        <h1 className="text-5xl font-semibold">Events</h1>
        <div className="mt-2 text-[#717171]">
          Explore club activities and upcoming opportunities.
        </div>
      </div>
    </div>
  );
}
