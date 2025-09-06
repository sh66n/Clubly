import { auth } from "@/auth";
import EventGrid from "@/components/Events/EventGrid";
import ScheduleEventButton from "@/components/Events/ScheduleEventButton";
import { Plus } from "lucide-react";
import Link from "next/link";
import React from "react";
import { toast } from "sonner";

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
      <div className="grow mt-8">
        {session?.user?.role === "club-admin" && (
          <div className="flex justify-end mb-4">
            <ScheduleEventButton />
          </div>
        )}
        <div className="flex justify-center">
          <EventGrid events={allEvents} user={session?.user} />
        </div>
      </div>
    </div>
  );
}
