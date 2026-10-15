"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { StudentActivityItem } from "@/services/getUserActivity";
import { UserCertificateItem } from "@/services/getUserCertificates";
import { StudentSocialStats } from "@/services/getUserSocialNetwork";
import {
  CalendarCheck,
  Award,
  Users,
  Building2,
  ExternalLink,
  Download,
  Eye,
  CheckCircle,
  FileCheck,
} from "lucide-react";

interface StudentActivityListProps {
  activities: StudentActivityItem[];
  certificates: UserCertificateItem[];
  socialStats: StudentSocialStats;
}

export default function StudentActivityList({
  activities,
  certificates,
  socialStats,
}: StudentActivityListProps) {
  const [activeTab, setActiveTab] = useState<"recent" | "certificates" | "clubs" | "peers">("recent");

  return (
    <div className="bg-[#18181b]/80 backdrop-blur-sm rounded-xl border border-white/10 shadow-lg overflow-hidden">
      {/* Tab Navigation header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 pt-2">
        <div className="flex gap-4 text-xs font-semibold overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("recent")}
            className={`flex items-center gap-1.5 pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "recent"
                ? "border-emerald-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <CalendarCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Participations</span>
            <span className="text-[10px] text-zinc-500 font-mono">({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("certificates")}
            className={`flex items-center gap-1.5 pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "certificates"
                ? "border-emerald-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>Certificates</span>
            <span className="text-[10px] text-zinc-500 font-mono">({certificates.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("clubs")}
            className={`flex items-center gap-1.5 pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "clubs"
                ? "border-emerald-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            <span>Clubs</span>
            <span className="text-[10px] text-zinc-500 font-mono">({socialStats.followingClubsCount})</span>
          </button>

          <button
            onClick={() => setActiveTab("peers")}
            className={`flex items-center gap-1.5 pb-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === "peers"
                ? "border-emerald-500 text-white"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>Network</span>
            <span className="text-[10px] text-zinc-500 font-mono">({socialStats.followersCount})</span>
          </button>
        </div>

        <Link
          href="/events"
          className="text-xs text-zinc-400 hover:text-white hidden sm:flex items-center gap-1 pb-2 font-medium"
        >
          <span>Explore Events</span>
          <span className="text-[10px]">›</span>
        </Link>
      </div>

      {/* CONTENT LIST */}
      <div>
        {/* RECENT EVENTS TAB */}
        {activeTab === "recent" && (
          <div className="divide-y divide-white/5">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No recent event participation yet. Browse campus clubs and register for upcoming events!
              </div>
            ) : (
              activities.slice(0, 10).map((act) => (
                <div
                  key={act.id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0 pr-4">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <Link
                      href={`/events/${act.id}`}
                      className="text-white hover:text-emerald-400 font-medium truncate block max-w-sm sm:max-w-md transition-colors"
                    >
                      {act.name}
                    </Link>
                    <span className="text-[11px] text-zinc-400 hidden md:inline shrink-0">
                      • {act.clubName}
                    </span>
                    {act.rank && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 text-[10px] font-bold border border-amber-400/20 shrink-0">
                        {act.rank}
                      </span>
                    )}
                  </div>

                  <span className="text-zinc-500 font-mono text-[11px] whitespace-nowrap shrink-0">
                    {act.date}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* CERTIFICATES TAB (Visual Certificate Card Grid with high-fidelity preview) */}
        {activeTab === "certificates" && (
          <div className="p-4 sm:p-5">
            {certificates.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                <Award className="w-8 h-8 text-zinc-600 mx-auto mb-2 opacity-50" />
                No verified certificates issued yet. Complete technical workshops and events to earn official certificates!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => (
                  <div
                    key={cert.eventId}
                    className="group relative rounded-xl border border-white/10 bg-zinc-900/90 overflow-hidden hover:border-amber-400/40 transition-all duration-300 flex flex-col shadow-lg hover:shadow-amber-500/5"
                  >
                    {/* Visual Certificate Graphic Header */}
                    <div className="relative aspect-[16/10] w-full bg-[#121214] overflow-hidden border-b border-white/10 flex items-center justify-center p-3">
                      {cert.certificateUrl ? (
                        <div className="relative w-full h-full rounded shadow-inner overflow-hidden border border-white/10">
                          <Image
                            src={cert.certificateUrl}
                            alt={`${cert.eventName} Certificate`}
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full rounded border border-dashed border-amber-500/20 bg-amber-950/10 flex flex-col items-center justify-center text-amber-400/80 p-4 text-center">
                          <Award className="w-10 h-10 mb-2 opacity-80" />
                          <span className="text-xs font-semibold text-white">Certificate of {cert.rankValue}</span>
                          <span className="text-[10px] text-zinc-400 mt-0.5 line-clamp-1">{cert.eventName}</span>
                        </div>
                      )}

                      {/* Top Badges overlay */}
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase bg-amber-500 text-amber-950 shadow-md">
                          {cert.rankValue}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      </div>
                    </div>

                    {/* Metadata & Actions footer */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center gap-2 text-zinc-400 text-[11px] mb-1">
                          {cert.clubLogo && (
                            <div className="w-4 h-4 rounded-full overflow-hidden relative shrink-0">
                              <Image src={cert.clubLogo} alt={cert.clubName} fill className="object-cover" />
                            </div>
                          )}
                          <span className="truncate">{cert.clubName}</span>
                          <span>•</span>
                          <span>{cert.issueDate}</span>
                        </div>

                        <h4 className="text-white text-sm font-bold truncate group-hover:text-amber-300 transition-colors">
                          {cert.eventName}
                        </h4>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                        <Link
                          href={cert.publicUrl}
                          target="_blank"
                          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-medium border border-white/10 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-zinc-400" />
                          <span>View Full Record</span>
                        </Link>

                        <Link
                          href={cert.downloadUrl}
                          target="_blank"
                          className="p-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* FOLLOWING CLUBS TAB */}
        {activeTab === "clubs" && (
          <div className="divide-y divide-white/5">
            {socialStats.followingClubs.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                Not following any clubs yet. Explore student clubs on campus!
              </div>
            ) : (
              socialStats.followingClubs.map((club) => (
                <div
                  key={club._id}
                  className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors text-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-zinc-900 border border-white/10 overflow-hidden relative shrink-0">
                      <img
                        src={club.logo || "/images/default.png"}
                        alt={club.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/clubs/${club._id}`}
                        className="text-white font-medium hover:text-emerald-400 truncate block"
                      >
                        {club.name}
                      </Link>
                      <span className="text-[11px] text-zinc-400">{club.department || "Student Club"}</span>
                    </div>
                  </div>

                  <Link
                    href={`/clubs/${club._id}`}
                    className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] transition-colors flex items-center gap-1 border border-white/10"
                  >
                    <span>Visit Club</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              ))
            )}
          </div>
        )}

        {/* CAMPUS NETWORK TAB */}
        {activeTab === "peers" && (
          <div className="divide-y divide-white/5">
            {socialStats.followersList.length === 0 && socialStats.followingList.length === 0 ? (
              <div className="p-8 text-center text-xs text-zinc-400">
                No student connections yet. Network with peers during campus events!
              </div>
            ) : (
              [...socialStats.followersList, ...socialStats.followingList]
                .filter((item, index, self) => index === self.findIndex((t) => t._id === item._id))
                .map((peer) => (
                  <div
                    key={peer._id}
                    className="flex items-center justify-between px-5 py-3 hover:bg-white/[0.03] transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-zinc-900 border border-white/10 overflow-hidden relative shrink-0">
                        <img
                          src={peer.image || "/images/default.png"}
                          alt={peer.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/profiles/${peer._id}`}
                          className="text-white font-medium hover:text-emerald-400 truncate block"
                        >
                          {peer.name}
                        </Link>
                        <span className="text-[11px] text-zinc-400">{peer.department || "Student"}</span>
                      </div>
                    </div>

                    <Link
                      href={`/profiles/${peer._id}`}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-white text-[11px] transition-colors border border-white/10"
                    >
                      Profile
                    </Link>
                  </div>
                ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
