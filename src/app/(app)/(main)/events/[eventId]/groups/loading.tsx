import BackButton from "@/components/BackButton";
import { Command, Search } from "lucide-react";
import React from "react";

export default function Loading() {
  return (
    <div className="">
      {/* 1. Navigation Back Button Skeleton */}
      <BackButton />

      {/* 2. Header Section */}
      <div className="mt-4 space-y-3">
        <h1 className="text-5xl font-semibold mt-4">Groups</h1>
        <div className="my-2 text-[#717171] mb-4">
          All participant groups for this event
        </div>
      </div>

      {/* 3. Search Bar Placeholder */}
      <div className="relative max-w-xl group mb-8 mt-12">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 group-focus-within:text-white transition-colors">
          <Search size={18} />
        </div>

        <input
          type="text"
          placeholder="Filter teams..."
          className="w-full bg-[#0A0A0A] border border-[#1A1A1A] text-white rounded-2xl py-4 pl-12 pr-12 outline-none focus:border-gray-500 transition-all placeholder:text-gray-700 font-medium"
        />

        {/* Shortcut Hint (Hidden on Mobile) */}

        <div className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-2 py-1 rounded-md bg-[#1A1A1A] border border-white/5 text-[10px] text-gray-500 font-mono">
          <Command size={10} />
          <span>K</span>
        </div>
      </div>

      {/* 4. Group Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-48 w-full bg-gray-800 rounded-2xl border border-white/5 flex flex-col p-6 space-y-4"
          >
            {/* Inner Card Content Skeletons */}
            <div className="h-6 w-3/4 bg-gray-700/50 rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 w-full bg-gray-700/30 rounded-md" />
              <div className="h-4 w-5/6 bg-gray-700/30 rounded-md" />
            </div>
            <div className="mt-auto h-8 w-24 bg-gray-700/50 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
