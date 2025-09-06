import ClubGrid from "@/components/Clubs/ClubGrid";
import React from "react";

const getAllClubs = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/clubs`, {
    method: "GET",
    cache: "no-store",
  });
  if (!res.ok) return null;
  const allClubs = await res.json();
  return allClubs;
};

export default async function Clubs() {
  const allClubs = await getAllClubs();
  return (
    <div>
      <h1 className="text-5xl font-semibold">Clubs</h1>
      <div className="my-2 text-[#717171]">
        Explore club activities and upcoming opportunities.
      </div>
      <ClubGrid clubs={allClubs} />
    </div>
  );
}
