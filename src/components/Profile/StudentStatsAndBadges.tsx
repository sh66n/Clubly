"use client";

import React, { useState } from "react";
import Link from "next/link";
import { StudentBadgeItem } from "@/services/getUserBadges";
import { ChevronRight, Trophy, Lock, X, Medal, Sparkles, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StandardCoinBadge, { getBadgeColors } from "./StandardCoinBadge";

interface StudentStatsAndBadgesProps {
  totalPoints: number;
  globalRank: number | string;
  attendedEvents: number;
  badges: StudentBadgeItem[];
  level: number;
  rankTier: string;
  totalCollegeEvents?: number;
  technicalCount?: number;
  culturalCount?: number;
  sportsCount?: number;
}

export default function StudentStatsAndBadges({
  totalPoints,
  globalRank,
  attendedEvents,
  badges,
  level,
  rankTier,
  totalCollegeEvents = 25,
  technicalCount = 0,
  culturalCount = 0,
  sportsCount = 0,
}: StudentStatsAndBadgesProps) {
  const [selectedBadge, setSelectedBadge] = useState<StudentBadgeItem | null>(null);
  const [showAllBadgesModal, setShowAllBadgesModal] = useState(false);

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const featuredBadge = unlockedBadges[0] || badges[0];

  // Real denominator and percentage
  const totalBenchmarks = Math.max(totalCollegeEvents, attendedEvents || 1);
  const completionPercent = Math.min(100, Math.round((attendedEvents / totalBenchmarks) * 100));
  const strokeDash = Math.round((completionPercent / 100) * 251);

  return (
    <div className="space-y-4">
      <style>{`
        @keyframes spinBadge {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes badgeShine {
          0% { transform: translateX(-150%) rotate(25deg); opacity: 0; }
          15% { opacity: 0.85; }
          35% { transform: translateX(150%) rotate(25deg); opacity: 0; }
          100% { transform: translateX(150%) rotate(25deg); opacity: 0; }
        }
        @keyframes sparkleStar {
          0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
          20% { transform: scale(1.1) rotate(45deg); opacity: 1; filter: drop-shadow(0 0 3px rgba(255,255,255,0.9)); }
          40% { transform: scale(0.6) rotate(90deg); opacity: 0.8; }
          60% { transform: scale(0) rotate(135deg); opacity: 0; }
        }
      `}</style>

      {/* TOP ROW: Rating Banner */}
      <div className="bg-[#18181b]/80 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Platform XP</span>
            <span className="text-2xl font-black text-white font-mono">{totalPoints}</span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Campus Rank</span>
            <span className="text-xl font-bold text-amber-400 font-mono flex items-center gap-1">
              #{typeof globalRank === "number" ? globalRank.toLocaleString() : globalRank}
            </span>
          </div>

          <div>
            <span className="text-[11px] text-zinc-400 block font-medium">Events Attended</span>
            <span className="text-xl font-bold text-white font-mono">{attendedEvents}</span>
          </div>
        </div>

        <div className="text-xs text-zinc-400 flex items-center gap-2">
          <span className="px-3 py-1 rounded-md bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30">
            {rankTier} • Level {level}
          </span>
          <span className="hidden sm:inline text-zinc-400">Verified Member</span>
        </div>
      </div>

      {/* MIDDLE ROW: Activity Gauge + 3D Badges Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left: Events Participation Progress */}
        <div className="md:col-span-7 bg-[#18181b]/80 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-lg flex items-center justify-between gap-6">
          {/* Radial representation */}
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#27272a"
                strokeWidth="7"
              />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                stroke="#10b981"
                strokeWidth="7"
                strokeDasharray={`${strokeDash} 251`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-xl font-black text-white font-mono">
                {attendedEvents}
                <span className="text-xs text-zinc-400 font-normal">/{totalBenchmarks}</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-medium">
                {completionPercent}% Participation
              </span>
            </div>
          </div>

          {/* Real Category Breakdown */}
          <div className="flex-1 space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
              <span className="text-emerald-400 font-medium">Technical Events</span>
              <span className="text-white font-mono font-bold">
                {technicalCount} <span className="text-zinc-500 font-normal">events</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
              <span className="text-amber-400 font-medium">Workshops & Talks</span>
              <span className="text-white font-mono font-bold">
                {culturalCount} <span className="text-zinc-500 font-normal">events</span>
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/80 border border-white/5">
              <span className="text-rose-400 font-medium">Sports & Extra-Curricular</span>
              <span className="text-white font-mono font-bold">
                {sportsCount} <span className="text-zinc-500 font-normal">events</span>
              </span>
            </div>
          </div>
        </div>

        {/* Right: Event Badges Showcase with 3D Rotating Dual-Sided Coin */}
        <div className="md:col-span-5 bg-[#18181b]/80 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-zinc-300 font-medium">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Event Badges</span>
              <span className="text-white font-bold font-mono text-sm ml-1">
                {unlockedBadges.length}
              </span>
            </div>

            <button
              onClick={() => setShowAllBadgesModal(true)}
              className="text-zinc-400 hover:text-white transition-colors p-1"
              title="View all badges"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Active / Most Recent Event Badge Spotlight */}
          <div
            onClick={() => featuredBadge && setSelectedBadge(featuredBadge)}
            className="flex items-center gap-4 py-3 cursor-pointer group"
          >
            <StandardCoinBadge
              badgeType={featuredBadge?.badgeType || "participation"}
              eventName={featuredBadge?.eventName || "CLUBLY"}
              size="lg"
            />

            <div className="min-w-0">
              <span className="text-[11px] text-zinc-400 block">Featured Event Badge</span>
              <span className="text-white text-sm font-bold truncate block group-hover:text-amber-300 transition-colors">
                {featuredBadge?.title || "Event Coin Badge"}
              </span>
              <span className="text-[11px] text-emerald-400 block mt-0.5">
                {featuredBadge?.unlocked
                  ? featuredBadge.unlockedAt
                    ? `Earned ${featuredBadge.unlockedAt}`
                    : "Collected Badge"
                  : "Attend Event to Unlock"}
              </span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-2 border-t border-white/10">
            <span>{badges.length - unlockedBadges.length} Locked Event Badges</span>
            <button
              onClick={() => setShowAllBadgesModal(true)}
              className="text-sky-400 hover:underline"
            >
              See all ({badges.length})
            </button>
          </div>
        </div>
      </div>

      {/* ALL EVENT BADGES MODAL */}
      <AnimatePresence>
        {showAllBadgesModal && (
          <div
            onClick={() => setShowAllBadgesModal(false)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl border border-white/10 bg-[#18181b] shadow-2xl overflow-hidden"
            >
              {/* Sticky Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10 bg-zinc-900/60 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Trophy className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white leading-tight">Event Badges & Trophies</h3>
                    <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                      {unlockedBadges.length} of {badges.length} Unlocked
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAllBadgesModal(false)}
                  className="p-1.5 rounded-lg bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Badges Grid with Sleek Scrollbar */}
              <div className="p-5 overflow-y-auto custom-scrollbar space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {badges.map((b, bIdx) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBadge(b)}
                      className={`flex items-center gap-3.5 p-3 rounded-xl border cursor-pointer transition-all ${
                        b.unlocked
                          ? "bg-zinc-900/80 border-white/15 hover:border-amber-400/50 hover:bg-zinc-800/90 shadow-md"
                          : "bg-black/30 border-white/5 opacity-40 hover:opacity-60"
                      }`}
                    >
                      {/* Standard 3D Coin Badge following streak-card conventions */}
                      {b.unlocked ? (
                        <StandardCoinBadge
                          badgeType={b.badgeType}
                          eventName={b.eventName}
                          size="sm"
                          delayIndex={bIdx}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center shrink-0">
                          <Lock className="w-4 h-4 text-zinc-600" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-xs font-bold text-white truncate">{b.title}</h4>
                          <span className="text-[10px] text-amber-400 uppercase font-mono">{b.rarity}</span>
                        </div>
                        <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">{b.clubName}</p>
                        <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SINGLE BADGE DETAIL MODAL */}
      <AnimatePresence>
        {selectedBadge && (
          <div
            onClick={() => setSelectedBadge(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-[#18181b] p-6 shadow-2xl text-center space-y-4 overflow-hidden"
            >
              <button
                onClick={() => setSelectedBadge(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Standard 3D Rotating Coin Badge in Detail Modal */}
              <div className="py-2 flex justify-center">
                {selectedBadge.unlocked ? (
                  <StandardCoinBadge
                    badgeType={selectedBadge.badgeType}
                    eventName={selectedBadge.eventName}
                    size="xl"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center mx-auto">
                    <Lock className="w-8 h-8 text-zinc-600" />
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 border border-amber-400/20">
                  {selectedBadge.rarity} Event Badge
                </span>
                <h4 className="text-base font-bold text-white mt-2">{selectedBadge.title}</h4>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{selectedBadge.description}</p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-left space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Event:</span>
                  <span className="text-white font-medium truncate max-w-[200px]">{selectedBadge.eventName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Club:</span>
                  <span className="text-white font-medium">{selectedBadge.clubName}</span>
                </div>
                {selectedBadge.date && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Date:</span>
                    <span className="text-zinc-400 font-mono">{selectedBadge.date}</span>
                  </div>
                )}
              </div>

              <div className="pt-1">
                <span className="text-xs text-emerald-400 font-semibold">
                  {selectedBadge.unlocked
                    ? `✓ Collected (${selectedBadge.unlockedAt || "Verified"})`
                    : "🔒 Attend this event to unlock badge"}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
