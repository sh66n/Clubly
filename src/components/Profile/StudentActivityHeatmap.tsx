"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import { ActivityHeatmapDay } from "@/services/getUserActivity";

interface StudentActivityHeatmapProps {
  days: ActivityHeatmapDay[];
  totalActivities: number;
  totalActiveDays: number;
  maxStreak: number;
}

interface ActiveTooltip {
  day: ActivityHeatmapDay;
  colIdx: number;
  rowIdx: number;
}

export default function StudentActivityHeatmap({
  days,
  totalActivities,
  totalActiveDays,
  maxStreak,
}: StudentActivityHeatmapProps) {
  const [tooltip, setTooltip] = useState<ActiveTooltip | null>(null);

  // Close tooltip on click outside or Esc
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!(e.target as HTMLElement).closest("[data-heatmap-cell]")) {
        setTooltip(null);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setTooltip(null);
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Group days into columns of 7 (Row 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat)
  const weeks = useMemo(() => {
    const cols: ActivityHeatmapDay[][] = [];
    let currentWeek: ActivityHeatmapDay[] = [];

    days.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        cols.push(currentWeek);
        currentWeek = [];
      }
    });

    if (currentWeek.length > 0) {
      cols.push(currentWeek);
    }

    return cols;
  }, [days]);

  // Compute dynamic month label positions based on first day of each week
  const monthLabelsWithPositions = useMemo(() => {
    const labels: { label: string; colIndex: number }[] = [];
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let lastMonth = -1;

    weeks.forEach((week, colIdx) => {
      if (week.length > 0) {
        // Parse YYYY-MM-DD reliably
        const [year, month, day] = week[0].date.split("-").map(Number);
        const m = month - 1;
        if (m !== lastMonth && colIdx - (labels[labels.length - 1]?.colIndex ?? -10) >= 3) {
          labels.push({ label: monthNames[m], colIndex: colIdx });
          lastMonth = m;
        }
      }
    });

    return labels;
  }, [weeks]);

  const getColor = (count: number, isSelected: boolean) => {
    if (isSelected) {
      return "outline outline-2 outline-emerald-400 -outline-offset-1 z-10 " + (count === 0 ? "bg-zinc-600" : "bg-emerald-400");
    }
    if (count === 0) return "bg-zinc-800/80 hover:bg-zinc-700 hover:border-zinc-500";
    if (count === 1) return "bg-emerald-950 border border-emerald-600/30 hover:bg-emerald-900";
    if (count === 2) return "bg-emerald-800 hover:bg-emerald-700";
    if (count === 3) return "bg-emerald-600 hover:bg-emerald-500";
    return "bg-emerald-500 hover:bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)]";
  };

  // Row 0 = Sun, Row 1 = Mon, Row 2 = Tue, Row 3 = Wed, Row 4 = Thu, Row 5 = Fri, Row 6 = Sat
  const dayLabels = [
    { text: "", isVisible: false },
    { text: "Mon", isVisible: true },
    { text: "", isVisible: false },
    { text: "Wed", isVisible: true },
    { text: "", isVisible: false },
    { text: "Fri", isVisible: true },
    { text: "", isVisible: false },
  ];

  const formatDisplayDate = (dateStr: string) => {
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dt = new Date(y, m - 1, d);
      return dt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const handleCellClick = (
    e: React.MouseEvent,
    day: ActivityHeatmapDay,
    colIdx: number,
    rowIdx: number
  ) => {
    e.stopPropagation();

    // Toggle off if already selected
    if (tooltip?.day.date === day.date) {
      setTooltip(null);
      return;
    }

    setTooltip({
      day,
      colIdx,
      rowIdx,
    });
  };

  return (
    <div className="relative bg-[#18181b]/80 backdrop-blur-sm rounded-xl p-5 border border-white/10 shadow-lg space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-white font-bold text-sm font-mono">{totalActivities}</span>
          <span className="text-zinc-400">activities in the past 12 months</span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
          <div>
            Total active days: <strong className="text-white font-mono">{totalActiveDays}</strong>
          </div>
          <div>
            Max streak: <strong className="text-white font-mono">{maxStreak}</strong>
          </div>
          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] border border-white/10 font-mono">
            Past 365 Days
          </span>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="overflow-x-auto pb-1 scrollbar-hide">
        <div className="min-w-[760px]">
          {/* Month labels aligned with columns */}
          <div className="relative h-4 mb-1">
            {monthLabelsWithPositions.map((item, idx) => (
              <span
                key={idx}
                className="absolute text-[10px] text-zinc-500 font-mono leading-none"
                style={{ left: `calc(32px + ${item.colIndex * 14}px)` }}
              >
                {item.label}
              </span>
            ))}
          </div>

          <div className="flex items-start gap-2">
            {/* Day of week labels on left: Mon (Row 1), Wed (Row 3), Fri (Row 5) */}
            <div className="flex flex-col gap-[3px] select-none w-6 shrink-0">
              {dayLabels.map((item, i) => (
                <div
                  key={i}
                  className="h-[11px] flex items-center justify-end text-[9px] text-zinc-500 font-mono leading-none"
                >
                  {item.text}
                </div>
              ))}
            </div>

            {/* 7 rows x 53 cols grid */}
            <div className="flex gap-[3px]">
              {weeks.map((week, colIdx) => (
                <div key={colIdx} className="flex flex-col gap-[3px]">
                  {week.map((day, rowIdx) => {
                    const isSelected = tooltip?.day.date === day.date;
                    const positionAbove = rowIdx >= 3;
                    const alignRight = colIdx > weeks.length - 12;
                    const alignLeft = colIdx < 10;

                    return (
                      <div
                        key={day.date}
                        className="relative w-[11px] h-[11px] shrink-0"
                      >
                        <button
                          type="button"
                          data-heatmap-cell="true"
                          onClick={(e) => handleCellClick(e, day, colIdx, rowIdx)}
                          className={`w-[11px] h-[11px] rounded-[2px] block transition-colors cursor-pointer focus:outline-none ${getColor(
                            day.count,
                            isSelected,
                          )}`}
                          title={`${day.date}: ${day.count} activities`}
                        />

                        {/* Speech Bubble Attached Directly to Cell as an absolute popup */}
                        {isSelected && (
                          <div
                            className={`absolute z-40 pointer-events-none transition-opacity duration-150 animate-in fade-in ${
                              positionAbove ? "bottom-[16px]" : "top-[16px]"
                            } ${
                              alignRight
                                ? "right-0"
                                : alignLeft
                                ? "left-0"
                                : "left-1/2 -translate-x-1/2"
                            }`}
                          >
                            {/* Caret pointing towards cell */}
                            {!positionAbove && (
                              <div
                                className={`w-0 h-0 border-x-[5px] border-x-transparent border-b-[5px] border-b-[#fef3c7] drop-shadow-sm ${
                                  alignRight ? "ml-auto mr-1" : alignLeft ? "ml-1" : "mx-auto"
                                }`}
                              />
                            )}

                            {/* Minimal Tooltip Body */}
                            <div className="bg-[#fef3c7] text-[#1c1917] px-3 py-1.5 rounded-lg shadow-xl border border-[#fde68a] text-[12px] font-medium whitespace-nowrap flex items-center gap-2">
                              {day.activities && day.activities.length > 0 ? (
                                <div className="flex flex-col gap-0.5">
                                  {day.activities.map((act) => (
                                    <div key={act.id} className="flex items-center gap-1.5 leading-snug">
                                      <span className="font-semibold text-zinc-900">{act.name}</span>
                                      <span className="text-zinc-600 text-[11px]">({act.clubName})</span>
                                      {act.rank && (
                                        <span className="text-amber-700 font-bold text-[11px]">
                                          • {act.rank}
                                        </span>
                                      )}
                                    </div>
                                  ))}
                                  <span className="text-[10px] text-zinc-500 font-mono">
                                    {formatDisplayDate(day.date)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-zinc-700 text-[11px]">
                                  No activity on {formatDisplayDate(day.date)}
                                </span>
                              )}
                            </div>

                            {/* Caret pointing downwards when placed above */}
                            {positionAbove && (
                              <div
                                className={`w-0 h-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#fef3c7] drop-shadow-sm ${
                                  alignRight ? "ml-auto mr-1" : alignLeft ? "ml-1" : "mx-auto"
                                }`}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
