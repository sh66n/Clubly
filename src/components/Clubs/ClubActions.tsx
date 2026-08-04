"use client";

import React, { useTransition } from "react";
import { toggleFollowClub, toggleBellClub } from "@/services/clubActions";
import { Bell, BellRing, UserPlus, UserMinus } from "lucide-react";

interface ClubActionsProps {
  clubId: string;
  isFollowing: boolean;
  hasBell: boolean;
  followerCount: number;
}

export default function ClubActions({ clubId, isFollowing, hasBell, followerCount }: ClubActionsProps) {
  const [isPending, startTransition] = useTransition();

  const handleFollow = () => {
    startTransition(async () => {
      await toggleFollowClub(clubId);
    });
  };

  const handleBell = () => {
    if (!isFollowing) return;
    startTransition(async () => {
      await toggleBellClub(clubId);
    });
  };

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm text-[#6D6D6D] font-medium mr-2">
        {followerCount} Followers
      </div>
      <button 
        onClick={handleFollow}
        disabled={isPending}
        className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition-colors border ${
          isFollowing 
            ? "bg-white text-gray-800 border-gray-300 hover:bg-gray-50"
            : "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
        }`}
      >
        {isFollowing ? (
          <>
            <UserMinus size={18} />
            Unfollow
          </>
        ) : (
          <>
            <UserPlus size={18} />
            Follow
          </>
        )}
      </button>

      {isFollowing && (
        <button
          onClick={handleBell}
          disabled={isPending}
          className={`p-2 rounded-full transition-colors border ${
            hasBell 
              ? "bg-yellow-50 text-yellow-600 border-yellow-200 hover:bg-yellow-100"
              : "bg-white text-gray-500 border-gray-300 hover:bg-gray-50"
          }`}
          title={hasBell ? "Turn off notifications" : "Turn on notifications"}
        >
          {hasBell ? <BellRing size={20} /> : <Bell size={20} />}
        </button>
      )}
    </div>
  );
}
