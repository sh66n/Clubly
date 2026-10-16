import ClubGrid from "@/components/Clubs/ClubGrid";
import { getAllClubsData } from "@/services/getEventsData";
import React from "react";

export default async function Clubs() {
  const allClubs = await getAllClubsData();

  return (
    <div className="flex flex-col min-h-full">
      <h1 className="text-5xl font-semibold">Clubs</h1>
      <div className="my-2 text-[#717171]">
        Explore club activities and upcoming opportunities.
      </div>

      <div className="grow mt-8">
        <div className="flex justify-center">
          {allClubs.length > 0 ? (
            <ClubGrid clubs={allClubs} />
          ) : (
            <div className="text-gray-500 text-center">No clubs found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
