import { auth } from "@/auth";
import EventGrid from "@/components/Events/EventGrid";
import React from "react";

const getAllEvents = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return null;

  const allEvents = await res.json();
  return allEvents;
};

export default async function Events() {
  const session = await auth();
  const allEvents = await getAllEvents();
  return (
    <div className="flex flex-col min-h-full">
      <h1 className="text-5xl font-semibold">Events</h1>
      <div className="my-2 text-[#717171]">
        Explore club activities and upcoming opportunities.
      </div>
      <div className="grow">
        <EventGrid events={allEvents} user={session?.user} />
      </div>
    </div>
  );
}
