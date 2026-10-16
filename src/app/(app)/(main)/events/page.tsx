import { auth } from "@/auth";
import EventGrid from "@/components/Events/EventGrid";
import ScheduleDropdown from "@/components/Events/ScheduleDropdown";
import SearchBar from "@/components/Events/SearchBar";
import ProfileCompletenessBanner from "@/components/User/ProfileCompletenessBanner";
import { getUserById } from "@/services/getUserById";
import {
  getEventsData,
  getSuperEventsData,
  getHackathonsData,
  getAllClubsData,
} from "@/services/getEventsData";
import React from "react";

export default async function Events({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q : "";
  const club = typeof params.club === "string" ? params.club : "";

  const [allEvents, allClubs, allSuperEvents, allHackathons, dbUser] =
    await Promise.all([
      getEventsData(query, club),
      getAllClubsData(),
      getSuperEventsData(club),
      getHackathonsData(query, club),
      session?.user?.id ? getUserById(session.user.id) : null,
    ]);

  return (
    <div className="flex flex-col min-h-full">
      <h1 className="text-5xl font-semibold">Events</h1>
      <div className="my-2 text-[#717171]">
        Explore club activities and upcoming opportunities.
      </div>

      <ProfileCompletenessBanner user={dbUser} />

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
        <EventGrid
          events={allEvents}
          superEvents={allSuperEvents}
          hackathons={allHackathons}
          userId={session?.user?.id}
        />
      </div>
    </div>
  );
}
