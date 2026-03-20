import { auth } from "@/auth";
import EventGrid from "@/components/Events/EventGrid";
import ScheduleDropdown from "@/components/Events/ScheduleDropdown";
import SearchBar from "@/components/Events/SearchBar";
import React from "react";

const getAllEvents = async (query: string | string[], club) => {
  const queryString = new URLSearchParams({
    q: String(query ?? ""),
    club: String(club ?? ""),
  });
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events?${queryString.toString()}`,
  );
  if (!res.ok) return null;
  return res.json();
};

const getAllSuperEvents = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/superevents`,
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data;
};

const getAllClubs = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clubs`);
  if (!res.ok) return null;
  return res.json();
};

export default async function Events({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const query = params.q || "";
  const club = params.club || "";
  const [allEvents, allClubs, allSuperEvents] = await Promise.all([
    getAllEvents(query, club),
    getAllClubs(),
    getAllSuperEvents(),
  ]);

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
        {session && session?.user?.role === "club-admin" && (
          <div className="flex justify-end mb-6">
            <ScheduleDropdown />
          </div>
        )}
        <EventGrid events={allEvents} superEvents={allSuperEvents} />
      </div>
    </div>
  );
}
