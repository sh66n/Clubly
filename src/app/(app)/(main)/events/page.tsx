import { auth } from "@/auth";
import EventGrid from "@/components/Events/EventGrid";
import ScheduleEventButton from "@/components/Events/ScheduleEventButton";
import SearchBar from "@/components/Events/SearchBar";
import ScheduleSuperEventButton from "@/components/SuperEvents/ScheduleSuperEventButton";
import React from "react";

const getAllEvents = async (query: string | string[], club) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events?q=${query}&club=${club}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  return res.json();
};

const getAllSuperEvents = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/superevents`,
    {
      cache: "no-store",
    },
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data;
};

const getAllClubs = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clubs`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
};

export default async function Events({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const query = (await searchParams).q || "";
  const club = (await searchParams).club || "";
  const allEvents = await getAllEvents(query, club);
  const allClubs = await getAllClubs();
  const allSuperEvents = await getAllSuperEvents();

  return (
    <div className="flex flex-col min-h-full">
      <h1 className="text-5xl font-semibold">Events</h1>
      <div className="my-2 text-[#717171]">
        Explore club activities and upcoming opportunities.
      </div>

      {/* <form className="mt-4 flex gap-2">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search events..."
          className="border rounded-lg p-2 w-full"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          Search
        </button>
      </form> */}
      <SearchBar clubs={allClubs} />

      <div className="grow mt-8">
        {session?.user?.role === "club-admin" && (
          <div className="flex flex-col md:flex-row gap-4 items-end md:justify-end mb-4">
            <ScheduleSuperEventButton />
            <ScheduleEventButton />
          </div>
        )}
        <EventGrid events={allEvents} superEvents={allSuperEvents} />
      </div>
    </div>
  );
}
