"use client";

import React from "react";
import { Trophy, Award } from "lucide-react";

export type BadgeType = "participation" | "winner_1" | "winner_2" | "winner_3" | "winner";

export interface CoinBadgeProps {
  badgeType: BadgeType | string;
  eventName: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  delayIndex?: number;
  animate?: boolean;
}

export function getBadgeColors(badgeType: string) {
  const isWinner = badgeType.startsWith("winner");

  if (badgeType === "winner" || badgeType === "winner_1") {
    // #1 Place - Lustrous Gold
    return {
      isWinner: true,
      edgeColor: "bg-[#b45309] border-[#92400e]",
      frontColor:
        "border-amber-500 ring-amber-200/90 bg-gradient-to-tr from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_14px_rgba(245,158,11,0.65)]",
      backColor:
        "border-amber-500 ring-amber-200/90 bg-gradient-to-bl from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_14px_rgba(245,158,11,0.65)]",
      textColorFront: "text-amber-950",
      textColorBack: "text-amber-950",
      iconColor: "text-amber-900",
      badgeLabel: "1st Place",
      rankName: "Gold Champion",
    };
  } else if (badgeType === "winner_2") {
    // #2 Place - Crisp Metallic Silver
    return {
      isWinner: true,
      edgeColor: "bg-[#475569] border-[#334155]",
      frontColor:
        "border-slate-300 ring-white/90 bg-gradient-to-tr from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_14px_rgba(203,213,225,0.7)]",
      backColor:
        "border-slate-300 ring-white/90 bg-gradient-to-bl from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_14px_rgba(203,213,225,0.7)]",
      textColorFront: "text-slate-900",
      textColorBack: "text-slate-900",
      iconColor: "text-slate-800",
      badgeLabel: "2nd Place",
      rankName: "Silver Runner Up",
    };
  } else if (badgeType === "winner_3") {
    // #3 Place - Glowing Warm Bronze
    return {
      isWinner: true,
      edgeColor: "bg-[#9a3412] border-[#7c2d12]",
      frontColor:
        "border-orange-500 ring-orange-200/90 bg-gradient-to-tr from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_14px_rgba(234,88,12,0.65)]",
      backColor:
        "border-orange-500 ring-orange-200/90 bg-gradient-to-bl from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_14px_rgba(234,88,12,0.65)]",
      textColorFront: "text-orange-950",
      textColorBack: "text-orange-950",
      iconColor: "text-orange-900",
      badgeLabel: "3rd Place",
      rankName: "Bronze Podium",
    };
  }

  // Participation - Emerald Green
  return {
    isWinner: false,
    edgeColor: "bg-[#4d7c0f] border-[#365314]",
    frontColor:
      "border-[#84cc16] ring-[#d9f99d]/90 bg-gradient-to-tr from-[#65a30d] via-[#ecfccb] to-[#4d7c0f] shadow-[0_0_12px_rgba(132,204,22,0.5)]",
    backColor:
      "border-[#84cc16] ring-[#d9f99d]/90 bg-gradient-to-bl from-[#65a30d] via-[#ecfccb] to-[#4d7c0f] shadow-[0_0_12px_rgba(132,204,22,0.5)]",
    textColorFront: "text-[#14532d]",
    textColorBack: "text-[#14532d]",
    iconColor: "text-[#14532d]",
    badgeLabel: "Participant",
    rankName: "Campus Participant",
  };
}

export default function StandardCoinBadge({
  badgeType,
  eventName,
  size = "md",
  className = "",
  delayIndex = 0,
  animate = true,
}: CoinBadgeProps) {
  const config = getBadgeColors(badgeType);

  const sizeClasses = {
    sm: "w-10 h-10 text-[6px]",
    md: "w-14 h-14 text-[7px]",
    lg: "w-16 h-16 text-[8px]",
    xl: "w-24 h-24 text-[10px]",
  }[size];

  const iconSizes = {
    sm: "w-3 h-3 mb-0.5",
    md: "w-4 h-4 mb-0.5",
    lg: "w-5 h-5 mb-0.5",
    xl: "w-7 h-7 mb-1",
  }[size];

  return (
    <div
      className={`relative shrink-0 [perspective:600px] flex items-center justify-center ${className}`}
    >
      <div
        className={`relative ${sizeClasses} [transform-style:preserve-3d] ${
          animate ? "animate-[spinBadge_4s_linear_infinite]" : ""
        }`}
        style={{
          animationDelay: `${(delayIndex % 3) * 0.4}s`,
        }}
      >
        {/* 3D Extrusion Edge Layers */}
        {[-2, -1.2, -0.4, 0.4, 1.2, 2].map((zOffset, i) => (
          <div
            key={i}
            className={`absolute inset-0 rounded-full border-2 ${config.edgeColor}`}
            style={{ transform: `translateZ(${zOffset}px)` }}
          />
        ))}

        {/* Front Face of Coin */}
        <div
          className={`absolute inset-0 rounded-full border-2 ring-1 ring-inset flex flex-col items-center justify-center p-0.5 shadow-xl [backface-visibility:hidden] overflow-hidden ${config.frontColor}`}
          style={{ transform: "translateZ(2.5px)" }}
        >
          {config.isWinner ? (
            <Trophy className={`${config.iconColor} ${iconSizes} relative z-10 shrink-0`} />
          ) : (
            <Award className={`${config.iconColor} ${iconSizes} relative z-10 shrink-0`} />
          )}
          <span
            className={`font-black uppercase tracking-tight text-center leading-[1.05] relative z-10 ${config.textColorFront}`}
          >
            {config.badgeLabel}
          </span>

          {/* Sparkles and Gleam Animation for Podium/Winners */}
          {config.isWinner && (
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
              <div
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px] animate-[badgeShine_2.5s_ease-in-out_infinite]"
                style={{ animationDelay: `${(delayIndex % 3) * 0.4}s` }}
              />
              {/* Sparkle 1 */}
              <div
                className="absolute top-1 right-1.5 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                style={{ animationDelay: `${(delayIndex % 3) * 0.4 + 0.15}s` }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-2.5 h-2.5 text-white fill-white drop-shadow-[0_0_3px_rgba(255,255,255,0.9)]"
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>
              {/* Sparkle 2 */}
              <div
                className="absolute bottom-1 left-1.5 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                style={{ animationDelay: `${(delayIndex % 3) * 0.4 + 0.45}s` }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-2 h-2 text-white fill-white drop-shadow-[0_0_3px_rgba(255,255,255,0.9)]"
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Back Face of Coin */}
        <div
          className={`absolute inset-0 rounded-full border-2 ring-1 ring-inset flex flex-col items-center justify-center p-1 shadow-xl [backface-visibility:hidden] overflow-hidden ${config.backColor}`}
          style={{ transform: "translateZ(-2.5px) rotateY(180deg)" }}
        >
          <span
            className={`font-black uppercase tracking-tight text-center line-clamp-3 leading-tight px-0.5 relative z-10 ${config.textColorBack}`}
          >
            {eventName}
          </span>

          {config.isWinner && (
            <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
              <div
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/80 to-transparent blur-[1px] animate-[badgeShine_2.5s_ease-in-out_infinite]"
                style={{ animationDelay: `${(delayIndex % 3) * 0.4 + 1.25}s` }}
              />
              <div
                className="absolute top-1.5 left-1.5 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                style={{ animationDelay: `${(delayIndex % 3) * 0.4 + 1.4}s` }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-2.5 h-2.5 text-white fill-white drop-shadow-[0_0_3px_rgba(255,255,255,0.9)]"
                >
                  <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
