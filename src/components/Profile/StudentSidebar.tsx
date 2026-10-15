"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StudentSocialStats } from "@/services/getUserSocialNetwork";
import { toggleFollowUser } from "@/services/userActions";
import {
  MapPin,
  Share2,
  CalendarCheck,
  Building2,
  Flame,
  Award,
  UserCheck,
  UserPlus,
  Edit3,
} from "lucide-react";
import { toast } from "sonner";

interface StudentSidebarProps {
  user: {
    _id?: string;
    name: string;
    email: string;
    image: string;
    role: string;
    college?: string;
    department?: string;
    year?: number;
    bio?: string;
  };
  globalRank: number | string;
  socialStats: StudentSocialStats;
  currentUserId?: string;
  eventsCount: number;
  totalPoints: number;
  badgesCount: number;
}

export default function StudentSidebar({
  user,
  globalRank,
  socialStats: initialSocial,
  currentUserId,
  eventsCount,
  totalPoints,
  badgesCount,
}: StudentSidebarProps) {
  const [isFollowing, setIsFollowing] = useState(initialSocial.isFollowingByViewer);
  const [followersCount, setFollowersCount] = useState(initialSocial.followersCount);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const isSelf = currentUserId && user._id && currentUserId === user._id;

  const handleFollowToggle = async () => {
    if (!currentUserId) {
      toast.error("Please log in to follow students");
      return;
    }
    if (!user._id) return;

    try {
      setLoadingFollow(true);
      const res = await toggleFollowUser(user._id);
      if (res === "followed") {
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        toast.success(`You are now following ${user.name}`);
      } else {
        setIsFollowing(false);
        setFollowersCount((prev) => Math.max(0, prev - 1));
        toast.info(`Unfollowed ${user.name}`);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update follow status");
    } finally {
      setLoadingFollow(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Profile link copied to clipboard!");
    }
  };

  // Derive username handle from email
  const handle = user.email ? user.email.split("@")[0] : user.name.toLowerCase().replace(/\s+/g, "");

  return (
    <div className="w-full lg:w-[280px] shrink-0 space-y-4 text-[13px] text-[#9ca3af]">
      {/* 1. Profile Top Card */}
      <div className="bg-[#18181b]/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-black/40 border border-white/10 shrink-0">
            <Image
              src={user.image || "/images/default.png"}
              alt={user.name}
              fill
              className="object-cover"
              sizes="80px"
              priority
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h1 className="text-white text-lg font-bold truncate tracking-tight">
                {user.name}
              </h1>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block shrink-0" title="Active Student" />
            </div>

            <p className="text-xs text-zinc-400 truncate">@{handle}</p>

            <div className="mt-2 text-xs flex items-center gap-1.5">
              <span className="text-zinc-400">Rank</span>
              <span className="text-amber-400 font-bold font-mono">
                #{typeof globalRank === "number" ? globalRank.toLocaleString() : globalRank}
              </span>
            </div>
          </div>
        </div>

        {/* Social Follow Numbers */}
        <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/10 text-xs">
          <div>
            <strong className="text-white font-semibold">{initialSocial.followingCount + initialSocial.followingClubsCount}</strong>{" "}
            <span className="text-zinc-400">Following</span>
          </div>
          <div>
            <strong className="text-white font-semibold">{followersCount}</strong>{" "}
            <span className="text-zinc-400">Followers</span>
          </div>
        </div>

        {/* Action Button: Edit Profile (Self) OR Follow (Other) + Share */}
        <div className="flex items-center gap-2 mt-4">
          {isSelf ? (
            <Link
              href="/me/edit"
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 font-semibold text-xs border border-emerald-500/30 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          ) : (
            <button
              onClick={handleFollowToggle}
              disabled={loadingFollow}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg font-semibold text-xs transition-colors ${
                isFollowing
                  ? "bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                  : "bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/40"
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}

          <button
            onClick={handleShare}
            className="p-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-white/10 transition-colors"
            title="Share Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Details */}
        <div className="mt-4 pt-3 border-t border-white/10 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-zinc-400">
            <MapPin className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span className="truncate">{user.college || "Campus Community"}</span>
          </div>

          {user.bio && (
            <p className="pt-1 text-zinc-300 leading-relaxed text-xs">
              {user.bio}
            </p>
          )}
        </div>
      </div>

      {/* 2. Campus Activity & Impact Card (100% computed from real DB data) */}
      <div className="bg-[#18181b]/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg space-y-3">
        <h3 className="text-white text-xs font-bold uppercase tracking-wider text-zinc-300">
          Campus Activity
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-zinc-400">
              <CalendarCheck className="w-4 h-4 text-emerald-400" /> Events Attended
            </span>
            <span className="text-white font-semibold font-mono">{eventsCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-zinc-400">
              <Award className="w-4 h-4 text-amber-400" /> Badges Earned
            </span>
            <span className="text-white font-semibold font-mono">{badgesCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-zinc-400">
              <Building2 className="w-4 h-4 text-sky-400" /> Clubs Followed
            </span>
            <span className="text-white font-semibold font-mono">{initialSocial.followingClubsCount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-zinc-400">
              <Flame className="w-4 h-4 text-orange-400" /> Total XP
            </span>
            <span className="text-white font-semibold font-mono">{totalPoints}</span>
          </div>
        </div>
      </div>

      {/* 3. Student Department / Year */}
      <div className="bg-[#18181b]/80 backdrop-blur-sm rounded-xl p-4 border border-white/10 shadow-lg space-y-3">
        <h3 className="text-white text-xs font-bold uppercase tracking-wider text-zinc-300">
          Academic Domain
        </h3>
        <div className="flex flex-wrap gap-1.5">
          <span className="px-2.5 py-1 rounded bg-zinc-800/80 text-zinc-300 text-xs font-mono border border-white/5">
            {user.department || "Engineering"}
          </span>
          {user.year && (
            <span className="px-2.5 py-1 rounded bg-zinc-800/80 text-zinc-300 text-xs font-mono border border-white/5">
              Year {user.year}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
