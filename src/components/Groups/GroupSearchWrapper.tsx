"use client";

import React, { useState, useMemo } from "react";
import { Search, X, Command } from "lucide-react";
import GroupGrid from "./GroupGrid";

interface GroupSearchWrapperProps {
  initialGroups: any[];
  eventId: string;
}

export default function GroupSearchWrapper({
  initialGroups,
  eventId,
}: GroupSearchWrapperProps) {
  const [query, setQuery] = useState("");

  // Memoize filtering for instant performance
  const filteredGroups = useMemo(() => {
    if (!query.trim()) return initialGroups;
    return initialGroups.filter((group) =>
      group.name.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query, initialGroups]);

  return (
    <div className="space-y-12">
      {/* --- Minimalist Search Input --- */}
      <div className="relative max-w-xl group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-white transition-colors">
          <Search size={18} />
        </div>

        <input
          type="text"
          placeholder="Filter teams..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-white rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-gray-500 transition-all placeholder:text-gray-700 font-medium"
        />

        {/* Clear Button */}
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg text-gray-500 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        )}

        {/* Shortcut Hint (Hidden on Mobile) */}
        {!query && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-[#1A1A1A] border border-white/5 text-[10px] text-gray-500 font-mono">
            <Command size={10} />
            <span>K</span>
          </div>
        )}
      </div>

      {/* --- Results Content --- */}
      {filteredGroups.length > 0 ? (
        <GroupGrid groups={filteredGroups} eventId={eventId} />
      ) : (
        <div className="py-24 flex flex-col items-center justify-center border border-dashed border-[#1A1A1A] rounded-[2.5rem]">
          <p className="text-gray-500 font-medium tracking-tight">
            No teams match "{query}"
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-4 text-xs text-white underline underline-offset-4 opacity-50 hover:opacity-100 transition-opacity"
          >
            Clear filter
          </button>
        </div>
      )}
    </div>
  );
}
