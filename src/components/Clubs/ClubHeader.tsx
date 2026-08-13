import { getColorFromString } from "@/lib/utils";
import { IClub } from "@/models/club.schema";
import React from "react";
import ClubActions from "./ClubActions";

interface ClubHeaderProps {
  club: IClub;
  user?: any;
}

export default function ClubHeader({ club, user }: ClubHeaderProps) {
  const colorClass = getColorFromString(club._id.toString());
  
  const userId = user?._id || user?.id;
  const isFollowing = userId && club.followers ? club.followers.some((id: any) => id.toString() === userId) : false;
  const hasBell = userId && club.bellFollowers ? club.bellFollowers.some((id: any) => id.toString() === userId) : false;
  const followerCount = club.followers ? club.followers.length : 0;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-2xl sm:text-3xl font-bold">{club.fullName}</span>
          <span
            className={`${colorClass} text-sm sm:text-base font-semibold px-2.5 py-0.5 rounded-full border border-white h-fit`}
          >
            {club.name}
          </span>
        </div>
        
        {user && (
          <div className="self-start sm:self-auto">
            <ClubActions 
              clubId={club._id.toString()} 
              isFollowing={isFollowing} 
              hasBell={hasBell}
              followerCount={followerCount} 
            />
          </div>
        )}
      </div>
      <div className="text-sm sm:text-base text-[#6D6D6D]">
        Associated with the department of {club.department}
      </div>

      <div className="flex items-center gap-6 text-sm text-[#6D6D6D] mt-1">
        <span>{club.events ? club.events.length : 0} Events</span>
        <span>{(club as any).totalMembers ?? 0} Members</span>
      </div>
    </div>
  );
}
