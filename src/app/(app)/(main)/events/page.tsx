import { auth } from "@/auth";
import EventGrid from "@/components/Events/EventGrid";
import ScheduleDropdown from "@/components/Events/ScheduleDropdown";
import SearchBar from "@/components/Events/SearchBar";
import ProfileCompletenessBanner from "@/components/User/ProfileCompletenessBanner";
import { getUserById } from "@/services/getUserById";
import React from "react";

const safeJson = async (res: Response) => {
  if (!res.ok) return null;
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON response:", text.slice(0, 100));
    return null;
  }
};

const getAllEvents = async (query: string | string[], club: string | string[]) => {
  try {
    const queryString = new URLSearchParams({
      q: String(query ?? ""),
      club: String(club ?? ""),
    });
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events?${queryString.toString()}`,
      { cache: "no-store" }
    );
    const data = await safeJson(res);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching events:", err);
    return [];
  }
};

const getAllSuperEvents = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/superevents`,
      { cache: "no-store" }
    );
    const data = await safeJson(res);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching super events:", err);
    return [];
  }
};

const getAllHackathons = async (query: string | string[], club: string | string[]) => {
  try {
    const queryString = new URLSearchParams({
      q: String(query ?? ""),
      club: String(club ?? ""),
    });
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/hackathons?${queryString.toString()}`,
      { cache: "no-store" }
    );
    const data = await safeJson(res);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching hackathons:", err);
    return [];
  }
};

const getAllClubs = async () => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clubs`, {
      cache: "no-store",
    });
    const data = await safeJson(res);
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error("Error fetching clubs:", err);
    return [];
  }
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
  const [allEvents, allClubs, allSuperEvents, allHackathons] = await Promise.all([
    getAllEvents(query, club),
    getAllClubs(),
    getAllSuperEvents(),
    getAllHackathons(query, club),
  ]);
  const dbUser = session?.user?.id ? await getUserById(session.user.id) : null;

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
