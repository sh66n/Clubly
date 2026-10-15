"use client";

import React, { useState } from "react";
import Image from "next/image";
import { GamificationStats } from "@/lib/gamification";
import { Award, CalendarCheck, Flame, Trophy, ShieldCheck, Sparkles, UserPlus, UserCheck, Users, Building } from "lucide-react";
import { motion } from "framer-motion";
import { toggleFollowUser } from "@/services/userActions";
import { toast } from "sonner";

interface ProfileHeroProps {
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
  gamification: GamificationStats;
  eventsAttended: number;
  badgesCount: number;
  certificatesCount: number;
  currentUserId?: string;
  isFollowingInitial?: boolean;
  followersCountInitial?: number;
  followingCountInitial?: number;
  followingClubsCount?: number;
}

export default function ProfileHero({
  user,
  gamification,
  eventsAttended,
  badgesCount,
  certificatesCount,
  currentUserId,
  isFollowingInitial = false,
  followersCountInitial = 0,
  followingCountInitial = 0,
  followingClubsCount = 0,
}: ProfileHeroProps) {
  const [isFollowing, setIsFollowing] = useState(isFollowingInitial);
  const [followersCount, setFollowersCount] = useState(followersCountInitial);
  const [loadingFollow, setLoadingFollow] = useState(false);

  const yearLabels: Record<number, string> = {
    1: "First Year (FE)",
    2: "Second Year (SE)",
    3: "Third Year (TE)",
    4: "Fourth Year (BE)",
  };

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

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-black/95 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-violet-600/15 blur-3xl" />
      <div className="pointer-events-none absolute top-10 right-0 h-80 w-80 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8">
        {/* Avatar with Animated Gamified Level Ring */}
        <div className="relative group shrink-0">
          <div
            className={`relative p-1 rounded-full bg-gradient-to-tr ${
              gamification.rankTier === "Legendary"
                ? "from-amber-400 via-yellow-300 to-orange-500 animate-spin-slow shadow-[0_0_25px_rgba(250,204,21,0.4)]"
                : gamification.rankTier === "Diamond"
                ? "from-cyan-400 via-sky-300 to-indigo-500 shadow-[0_0_20px_rgba(34,211,238,0.35)]"
                : gamification.rankTier === "Platinum"
                ? "from-emerald-400 via-teal-300 to-cyan-500 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                : "from-amber-500 via-orange-400 to-yellow-600 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            }`}
          >
            <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden border-2 border-slate-950 bg-slate-900">
              <Image
                src={user.image || "/images/default.png"}
                alt={user.name}
                fill
                priority
                sizes="(max-width: 768px) 128px, 144px"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
          </div>

          {/* Level Pill */}
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-white/20 text-xs font-bold text-white shadow-lg whitespace-nowrap">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>LVL {gamification.level}</span>
          </div>
        </div>

        {/* User Identity & Info */}
        <div className="flex-1 text-center lg:text-left space-y-3">
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              {user.name}
            </h1>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${gamification.tierBg} ${gamification.tierBorder} ${gamification.tierColor}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              {gamification.rankTier} • {gamification.levelTitle}
            </span>

            {/* Follow/Unfollow Button for other students */}
            {!isSelf && currentUserId && (
              <button
                onClick={handleFollowToggle}
                disabled={loadingFollow}
                className={`ml-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all shadow-sm ${
                  isFollowing
                    ? "bg-white/10 hover:bg-red-500/20 text-slate-200 hover:text-red-300 border border-white/20 hover:border-red-500/40"
                    : "bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400/30"
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
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
          </div>

          {/* Academic & College Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs md:text-sm text-slate-300">
            {user.department && (
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-200">
                {user.department}
              </span>
            )}
            {user.year && (
              <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-blue-300">
                {yearLabels[user.year] || `Year ${user.year}`}
              </span>
            )}
            <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-400">
              {user.college || "Campus Member"}
            </span>

            {/* Social Followers Counters */}
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1 text-xs">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <strong>{followersCount}</strong> Followers
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-slate-300 flex items-center gap-1 text-xs">
              <Building className="w-3.5 h-3.5 text-amber-400" />
              <strong>{followingClubsCount}</strong> Clubs Followed
            </span>
          </div>

          {/* XP Progress Bar */}
          <div className="pt-2 max-w-xl mx-auto lg:mx-0">
            <div className="flex justify-between items-center text-xs font-medium mb-1.5">
              <span className="text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-400 inline" /> XP to Next Level
              </span>
              <span className="text-slate-200 font-mono">
                {gamification.currentLevelXp} / {gamification.xpForNextLevel} XP ({gamification.progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-white/5">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${gamification.progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full bg-gradient-to-r ${
                  gamification.rankTier === "Legendary"
                    ? "from-amber-500 to-yellow-400"
                    : gamification.rankTier === "Diamond"
                    ? "from-cyan-500 to-sky-400"
                    : gamification.rankTier === "Platinum"
                    ? "from-emerald-500 to-teal-400"
                    : "from-amber-600 to-orange-400"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Quick Social Metrics (Bento Counter Cards) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 w-full lg:w-auto shrink-0">
          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-400/40 transition-colors">
            <div className="flex items-center gap-1 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Total XP
            </div>
            <span className="text-2xl font-black text-white font-mono">
              {gamification.totalPoints}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-400/40 transition-colors">
            <div className="flex items-center gap-1 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <CalendarCheck className="w-3.5 h-3.5" /> Events
            </div>
            <span className="text-2xl font-black text-white font-mono">
              {eventsAttended}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-violet-400/40 transition-colors">
            <div className="flex items-center gap-1 text-violet-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Trophy className="w-3.5 h-3.5" /> Badges
            </div>
            <span className="text-2xl font-black text-white font-mono">
              {badgesCount}
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-400/40 transition-colors">
            <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" /> Certificates
            </div>
            <span className="text-2xl font-black text-white font-mono">
              {certificatesCount}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
