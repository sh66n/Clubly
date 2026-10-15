"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { StudentSocialStats } from "@/services/getUserSocialNetwork";
import { toggleFollowClub } from "@/services/clubActions";
import { toggleFollowUser } from "@/services/userActions";
import { Users, Building, UserCheck, UserPlus, Check, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface SocialNetworkTabProps {
  socialStats: StudentSocialStats;
  currentUserId?: string;
  targetUserId: string;
}

export default function SocialNetworkTab({
  socialStats: initialStats,
  currentUserId,
  targetUserId,
}: SocialNetworkTabProps) {
  const [socialStats, setSocialStats] = useState<StudentSocialStats>(initialStats);
  const [subTab, setSubTab] = useState<"clubs" | "following" | "followers">("clubs");
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const isSelf = currentUserId === targetUserId;

  const handleToggleFollowUser = async (targetId: string) => {
    if (!currentUserId) {
      toast.error("Please log in to follow students");
      return;
    }
    try {
      setLoadingAction(`user-${targetId}`);
      const res = await toggleFollowUser(targetId);
      if (res === "followed") {
        toast.success("Following student!");
      } else {
        toast.info("Unfollowed student");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update follow status");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleToggleFollowClub = async (clubId: string) => {
    if (!currentUserId) {
      toast.error("Please log in to follow clubs");
      return;
    }
    try {
      setLoadingAction(`club-${clubId}`);
      const res = await toggleFollowClub(clubId);
      if (res === "followed") {
        toast.success("Following club!");
      } else {
        toast.info("Unfollowed club");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update follow status");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-tab navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Campus Social Network</h2>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10">
          <button
            onClick={() => setSubTab("clubs")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              subTab === "clubs"
                ? "bg-white text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Following Clubs</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {socialStats.followingClubsCount}
            </span>
          </button>

          <button
            onClick={() => setSubTab("followers")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              subTab === "followers"
                ? "bg-white text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Followers</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {socialStats.followersCount}
            </span>
          </button>

          <button
            onClick={() => setSubTab("following")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              subTab === "following"
                ? "bg-white text-slate-950 font-bold shadow"
                : "text-slate-400 hover:text-white hover:bg-white/5"
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Following Students</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300">
              {socialStats.followingCount}
            </span>
          </button>
        </div>
      </div>

      {/* CLUBS SUB-TAB */}
      {subTab === "clubs" && (
        <div>
          {socialStats.followingClubs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30">
              <Building className="w-10 h-10 text-slate-500 mb-2" />
              <h3 className="text-base font-bold text-white mb-1">Not Following Any Clubs</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                Explore student technical & cultural clubs on campus and follow them to unlock streak cards and stay notified!
              </p>
              <Link
                href="/clubs"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors"
              >
                Discover Clubs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialStats.followingClubs.map((club) => (
                <div
                  key={club._id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all group"
                >
                  <Link
                    href={`/clubs/${club._id}`}
                    className="flex items-center gap-3 min-w-0 flex-1 mr-3"
                  >
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                      <Image
                        src={club.logo || "/images/default.png"}
                        alt={club.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                        {club.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {club.department || "Student Club"}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href={`/clubs/${club._id}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    title="View Club"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FOLLOWERS SUB-TAB */}
      {subTab === "followers" && (
        <div>
          {socialStats.followersList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30">
              <Users className="w-10 h-10 text-slate-500 mb-2" />
              <h3 className="text-base font-bold text-white mb-1">No Followers Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Compete in hackathons, share certificates, and connect with fellow students on campus!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialStats.followersList.map((follower) => (
                <div
                  key={follower._id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all group"
                >
                  <Link
                    href={`/profiles/${follower._id}`}
                    className="flex items-center gap-3 min-w-0 flex-1 mr-3"
                  >
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                      <Image
                        src={follower.image || "/images/default.png"}
                        alt={follower.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors truncate">
                        {follower.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {follower.department || "Student"}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href={`/profiles/${follower._id}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FOLLOWING STUDENTS SUB-TAB */}
      {subTab === "following" && (
        <div>
          {socialStats.followingList.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30">
              <UserCheck className="w-10 h-10 text-slate-500 mb-2" />
              <h3 className="text-base font-bold text-white mb-1">Not Following Any Students</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Follow teammates, tournament champions, and club friends to view their progress and badges!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialStats.followingList.map((student) => (
                <div
                  key={student._id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all group"
                >
                  <Link
                    href={`/profiles/${student._id}`}
                    className="flex items-center gap-3 min-w-0 flex-1 mr-3"
                  >
                    <div className="relative w-11 h-11 rounded-full overflow-hidden border border-white/10 bg-slate-900 shrink-0">
                      <Image
                        src={student.image || "/images/default.png"}
                        alt={student.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                        {student.name}
                      </h4>
                      <p className="text-xs text-slate-400 truncate">
                        {student.department || "Student"}
                      </p>
                    </div>
                  </Link>

                  <Link
                    href={`/profiles/${student._id}`}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
