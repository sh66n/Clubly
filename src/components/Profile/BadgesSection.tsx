"use client";

import React, { useState } from "react";
import { StudentBadgeItem } from "@/services/getUserBadges";
import {
  Trophy,
  Medal,
  Award,
  Flame,
  Footprints,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  Lock,
  CheckCircle2,
  X,
  Info,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BadgesSectionProps {
  badges: StudentBadgeItem[];
}

export default function BadgesSection({ badges }: BadgesSectionProps) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedBadge, setSelectedBadge] = useState<StudentBadgeItem | null>(null);

  const getBadgeIcon = (iconName: string, className: string = "w-6 h-6") => {
    switch (iconName) {
      case "Trophy":
        return <Trophy className={className} />;
      case "Medal":
        return <Medal className={className} />;
      case "Award":
        return <Award className={className} />;
      case "Flame":
        return <Flame className={className} />;
      case "Footprints":
        return <Footprints className={className} />;
      case "Sparkles":
        return <Sparkles className={className} />;
      case "Zap":
        return <Zap className={className} />;
      case "Crown":
        return <Crown className={className} />;
      case "ShieldCheck":
        return <ShieldCheck className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const getRarityConfig = (rarity: StudentBadgeItem["rarity"], unlocked: boolean) => {
    if (!unlocked) {
      return {
        badgeBorder: "border-dashed border-white/10 hover:border-white/20",
        badgeBg: "bg-slate-900/30",
        iconColor: "text-slate-500",
        tag: "Locked",
        tagClass: "bg-slate-800/80 text-slate-400 border border-slate-700/50",
        glow: "",
      };
    }

    switch (rarity) {
      case "legendary":
        return {
          badgeBorder: "border-amber-400/50 hover:border-yellow-300",
          badgeBg: "bg-gradient-to-br from-amber-500/15 via-yellow-500/10 to-orange-600/15",
          iconColor: "text-yellow-400",
          tag: "Legendary",
          tagClass: "bg-gradient-to-r from-amber-500/30 to-yellow-500/30 text-amber-300 border border-amber-400/50",
          glow: "shadow-[0_0_20px_rgba(245,158,11,0.2)]",
        };
      case "epic":
        return {
          badgeBorder: "border-purple-500/40 hover:border-purple-400",
          badgeBg: "bg-gradient-to-br from-purple-500/15 via-violet-500/10 to-indigo-600/15",
          iconColor: "text-purple-300",
          tag: "Epic",
          tagClass: "bg-purple-500/20 text-purple-300 border border-purple-500/40",
          glow: "shadow-[0_0_20px_rgba(168,85,247,0.2)]",
        };
      case "rare":
        return {
          badgeBorder: "border-cyan-500/40 hover:border-cyan-300",
          badgeBg: "bg-gradient-to-br from-cyan-500/15 via-sky-500/10 to-blue-600/15",
          iconColor: "text-cyan-300",
          tag: "Rare",
          tagClass: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40",
          glow: "shadow-[0_0_15px_rgba(34,211,238,0.15)]",
        };
      case "common":
      default:
        return {
          badgeBorder: "border-emerald-500/40 hover:border-emerald-300",
          badgeBg: "bg-gradient-to-br from-emerald-500/10 to-slate-900/60",
          iconColor: "text-emerald-300",
          tag: "Common",
          tagClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40",
          glow: "",
        };
    }
  };

  const filteredBadges = badges.filter((b) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "unlocked") return b.unlocked;
    if (activeCategory === "locked") return !b.unlocked;
    return b.category === activeCategory;
  });

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <>
      <style>{`
        @keyframes spinBadgeProfile {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }
        @keyframes badgeShineProfile {
          0% { transform: translateX(-150%) rotate(25deg); opacity: 0; }
          15% { opacity: 0.85; }
          35% { transform: translateX(150%) rotate(25deg); opacity: 0; }
          100% { transform: translateX(150%) rotate(25deg); opacity: 0; }
        }
      `}</style>

      <div className="space-y-6">
        {/* Category Pills & Unlock Counter */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Badges & Achievements</h2>
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
              {unlockedCount} / {badges.length} Unlocked
            </span>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-white/10">
            {[
              { id: "all", label: "All" },
              { id: "event_badges", label: "Event Badges" },
              { id: "milestones", label: "Milestones" },
              { id: "community", label: "Community" },
              { id: "unlocked", label: "Unlocked" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeCategory === tab.id
                    ? "bg-white text-slate-950 font-bold shadow"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBadges.map((badge, idx) => {
            const config = getRarityConfig(badge.rarity, badge.unlocked);

            return (
              <motion.div
                key={badge.id}
                whileHover={{ y: -3, scale: 1.01 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSelectedBadge(badge)}
                className={`cursor-pointer group relative flex flex-col justify-between p-5 rounded-2xl border transition-all ${config.badgeBorder} ${config.badgeBg} ${config.glow}`}
              >
                {/* Top row: 3D Coin Badge or Standard Icon + Rarity Tag */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  {badge.is3dCoin && badge.unlocked ? (
                    <div className="w-12 h-12 flex items-center justify-center [perspective:500px]">
                      <CoinBadgePreview
                        badgeType={badge.badgeType}
                        numberOfWinners={badge.numberOfWinners}
                        eventName={badge.eventName || badge.title}
                        index={idx}
                        size="sm"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        badge.unlocked
                          ? "bg-black/40 border-white/15"
                          : "bg-black/20 border-white/5 opacity-40"
                      }`}
                    >
                      {badge.unlocked ? (
                        <div className={config.iconColor}>
                          {getBadgeIcon(badge.iconName, "w-6 h-6")}
                        </div>
                      ) : (
                        <Lock className="w-5 h-5 text-slate-500" />
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-1.5">
                    {badge.is3dCoin && (
                      <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                        <Coins className="w-2.5 h-2.5" /> Event
                      </span>
                    )}
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${config.tagClass}`}
                    >
                      {config.tag}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1 mb-3">
                  <h3
                    className={`text-sm font-bold ${
                      badge.unlocked ? "text-white group-hover:text-amber-300" : "text-slate-400"
                    } transition-colors line-clamp-1`}
                  >
                    {badge.title}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                {/* Bottom footer: Progress or Unlocked info */}
                <div className="pt-2 border-t border-white/5 text-[11px] flex items-center justify-between">
                  {badge.unlocked ? (
                    <span className="text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {badge.unlockedAt ? `Unlocked: ${badge.unlockedAt}` : "Unlocked"}
                    </span>
                  ) : badge.progressTarget ? (
                    <div className="w-full">
                      <div className="flex justify-between text-slate-400 text-[10px] mb-1">
                        <span>Progress</span>
                        <span>
                          {badge.progressCurrent} / {badge.progressTarget}
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-slate-500 rounded-full"
                          style={{
                            width: `${Math.min(
                              100,
                              ((badge.progressCurrent || 0) / badge.progressTarget) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> Locked Mystery
                    </span>
                  )}

                  <span className="text-slate-500 group-hover:text-white transition-colors ml-2">
                    <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive Badge Modal */}
        <AnimatePresence>
          {selectedBadge && (
            <div
              onClick={() => setSelectedBadge(null)}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md rounded-3xl border border-white/20 bg-slate-950 p-6 md:p-8 shadow-2xl overflow-hidden"
              >
                {/* Close Button */}
                <button
                  onClick={() => setSelectedBadge(null)}
                  className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Modal Body */}
                <div className="flex flex-col items-center text-center space-y-4 pt-2">
                  {selectedBadge.is3dCoin && selectedBadge.unlocked ? (
                    <div className="w-24 h-24 flex items-center justify-center [perspective:600px] my-2">
                      <CoinBadgePreview
                        badgeType={selectedBadge.badgeType}
                        numberOfWinners={selectedBadge.numberOfWinners}
                        eventName={selectedBadge.eventName || selectedBadge.title}
                        index={0}
                        size="lg"
                      />
                    </div>
                  ) : (
                    <div
                      className={`w-20 h-20 rounded-2xl flex items-center justify-center border-2 ${
                        selectedBadge.unlocked
                          ? "bg-slate-900 border-amber-400/50 shadow-[0_0_30px_rgba(250,204,21,0.25)]"
                          : "bg-slate-900 border-white/10"
                      }`}
                    >
                      {selectedBadge.unlocked ? (
                        <div className="text-amber-400">
                          {getBadgeIcon(selectedBadge.iconName, "w-10 h-10")}
                        </div>
                      ) : (
                        <Lock className="w-10 h-10 text-slate-500" />
                      )}
                    </div>
                  )}

                  <div className="space-y-1">
                    <div className="inline-block uppercase tracking-wider text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-white/10 text-amber-300 border border-white/15">
                      {selectedBadge.rarity} {selectedBadge.is3dCoin ? "Streak Coin" : "Badge"}
                    </div>
                    <h3 className="text-xl font-extrabold text-white">
                      {selectedBadge.title}
                    </h3>
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                    {selectedBadge.description}
                  </p>

                  {selectedBadge.eventName && (
                    <div className="w-full p-3 rounded-xl bg-white/[0.03] border border-white/10 text-xs text-left space-y-1">
                      <p className="text-slate-400">
                        <strong className="text-slate-300">Event:</strong> {selectedBadge.eventName}
                      </p>
                      {selectedBadge.clubName && (
                        <p className="text-slate-400">
                          <strong className="text-slate-300">Host Club:</strong> {selectedBadge.clubName}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="w-full pt-2">
                    {selectedBadge.unlocked ? (
                      <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> Unlocked • Official Streak Card Badge
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-900 border border-white/10 text-slate-400 text-xs font-medium">
                        <Lock className="w-4 h-4 text-slate-500" /> Complete requirement to unlock this badge
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

/**
 * 3D Spinning Coin Badge matching the exact aesthetic of the Streak Card feature!
 */
function CoinBadgePreview({
  badgeType,
  numberOfWinners = 1,
  eventName,
  index = 0,
  size = "sm",
}: {
  badgeType?: string | null;
  numberOfWinners?: number;
  eventName: string;
  index: number;
  size?: "sm" | "lg";
}) {
  const isWinner = badgeType?.startsWith("winner");

  let edgeColor = "bg-[#4d7c0f] border-[#365314]";
  let frontColor =
    "border-[#84cc16] ring-[#d9f99d]/90 bg-gradient-to-tr from-[#65a30d] via-[#ecfccb] to-[#4d7c0f] shadow-[0_0_12px_rgba(132,204,22,0.5)]";
  let backColor =
    "border-[#84cc16] ring-[#d9f99d]/90 bg-gradient-to-bl from-[#65a30d] via-[#ecfccb] to-[#4d7c0f] shadow-[0_0_12px_rgba(132,204,22,0.5)]";
  let textColorFront = "text-[#14532d]";
  let textColorBack = "text-[#14532d]";
  let iconColor = "text-[#14532d]";
  let badgeLabel = "Participant";

  if (badgeType === "winner" || badgeType === "winner_1") {
    // Gold
    edgeColor = "bg-[#b45309] border-[#92400e]";
    frontColor =
      "border-amber-500 ring-amber-200/90 bg-gradient-to-tr from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_12px_rgba(245,158,11,0.6)]";
    backColor =
      "border-amber-500 ring-amber-200/90 bg-gradient-to-bl from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_12px_rgba(245,158,11,0.6)]";
    textColorFront = "text-amber-950";
    textColorBack = "text-amber-950";
    iconColor = "text-amber-900";
    badgeLabel = "Winner";
  } else if (badgeType === "winner_2") {
    // Silver
    edgeColor = "bg-[#475569] border-[#334155]";
    frontColor =
      "border-slate-300 ring-white/90 bg-gradient-to-tr from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_12px_rgba(203,213,225,0.7)]";
    backColor =
      "border-slate-300 ring-white/90 bg-gradient-to-bl from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_12px_rgba(203,213,225,0.7)]";
    textColorFront = "text-slate-900";
    textColorBack = "text-slate-900";
    iconColor = "text-slate-800";
    badgeLabel = numberOfWinners === 2 ? "Runner Up" : "2nd Place";
  } else if (badgeType === "winner_3") {
    // Bronze
    edgeColor = "bg-[#9a3412] border-[#7c2d12]";
    frontColor =
      "border-orange-500 ring-orange-200/90 bg-gradient-to-tr from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_12px_rgba(234,88,12,0.6)]";
    backColor =
      "border-orange-500 ring-orange-200/90 bg-gradient-to-bl from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_12px_rgba(234,88,12,0.6)]";
    textColorFront = "text-orange-950";
    textColorBack = "text-orange-950";
    iconColor = "text-orange-900";
    badgeLabel = "3rd Place";
  }

  const coinDimensions = size === "lg" ? "w-20 h-20" : "w-11 h-11";
  const iconDimensions = size === "lg" ? "w-6 h-6" : "w-3 h-3";
  const textFrontSize = size === "lg" ? "text-[10px]" : "text-[5.5px]";
  const textBackSize = size === "lg" ? "text-[10px]" : "text-[6px]";

  return (
    <div
      className={`relative ${coinDimensions} [transform-style:preserve-3d] animate-[spinBadgeProfile_3.8s_linear_infinite]`}
      style={{ animationDelay: `${(index % 3) * 0.4}s` }}
    >
      {/* 3D Coin Edge / Thickness Layers */}
      {[-2, -1, 0, 1, 2].map((zOffset, i) => (
        <div
          key={i}
          className={`absolute inset-0 rounded-full border-2 ${edgeColor}`}
          style={{ transform: `translateZ(${zOffset}px)` }}
        />
      ))}

      {/* Front Face */}
      <div
        className={`absolute inset-0 rounded-full border-2 ring-1 ring-inset flex flex-col items-center justify-center p-0.5 shadow-lg [backface-visibility:hidden] overflow-hidden ${frontColor}`}
        style={{ transform: "translateZ(2.5px)" }}
      >
        {isWinner ? (
          <Trophy className={`${iconColor} ${iconDimensions} mb-0.5 relative z-10`} />
        ) : (
          <Award className={`${iconColor} ${iconDimensions} mb-0.5 relative z-10`} />
        )}
        <span
          className={`${textFrontSize} font-black uppercase tracking-tight text-center leading-[1.05] relative z-10 ${textColorFront}`}
        >
          {badgeLabel}
        </span>

        {isWinner && (
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
            <div
              className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px] animate-[badgeShineProfile_2.5s_ease-in-out_infinite]"
              style={{ animationDelay: `${(index % 3) * 0.4}s` }}
            />
          </div>
        )}
      </div>

      {/* Back Face */}
      <div
        className={`absolute inset-0 rounded-full border-2 ring-1 ring-inset flex flex-col items-center justify-center p-1 shadow-lg [backface-visibility:hidden] overflow-hidden ${backColor}`}
        style={{ transform: "translateZ(-2.5px) rotateY(180deg)" }}
      >
        <span
          className={`font-black uppercase ${textBackSize} tracking-tight text-center line-clamp-2 leading-tight px-0.5 relative z-10 ${textColorBack}`}
        >
          {eventName}
        </span>
      </div>
    </div>
  );
}
