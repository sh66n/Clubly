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
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="text-3xl">{club.fullName}</span>
          <span
            className={`${colorClass} text-xl font-semibold px-2 py-1 rounded-full border border-white h-fit`}
          >
            {club.name}
          </span>
        </div>
        
        {user && (
          <ClubActions 
            clubId={club._id.toString()} 
            isFollowing={isFollowing} 
            hasBell={hasBell}
            followerCount={followerCount} 
          />
        )}
      </div>
      <div className="text-[#6D6D6D]">
        Associated with the department of {club.department}
      </div>

      <div className="flex justify-between w-1/4 text-[#6D6D6D]">
        <span>{club.events ? club.events.length : 0} Events</span>
        <span>{(club as any).totalMembers ?? 0} Members</span>
        <span></span>
      </div>
    </div>
  );
}
