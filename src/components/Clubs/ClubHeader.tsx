import { getColorFromString } from "@/lib/utils";
import { IClub } from "@/models/club.schema";
import React from "react";

interface ClubHeaderProps {
  club: IClub;
}

export default function ClubHeader({ club }: ClubHeaderProps) {
  const colorClass = getColorFromString(club._id.toString());

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between">
        <span className="text-3xl">{club.fullName}</span>
        <span
          className={`${colorClass} text-xl font-semibold px-2 py-1 rounded-full border border-white h-fit`}
        >
          {club.name}
        </span>
      </div>
      <div className="text-[#6D6D6D]">
        Associated with the department of {club.department}
      </div>

      <div className="flex justify-between w-1/4 text-[#6D6D6D]">
        <span>{club.events.length} Events</span>
        <span>{club.coreMembers.length + club.volunteers.length} Members</span>
        <span></span>
      </div>
    </div>
  );
}
