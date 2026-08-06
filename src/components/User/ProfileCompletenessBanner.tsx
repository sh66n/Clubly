"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { getProfileStatus } from "@/lib/utils";

interface ProfileCompletenessBannerProps {
  user: any;
}

export default function ProfileCompletenessBanner({ user }: ProfileCompletenessBannerProps) {
  if (!user) return null;

  const { percentage, isComplete, missingFields } = getProfileStatus(user);

  if (isComplete) return null;

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
        <div className="text-sm text-zinc-300">
          Profile is <span className="font-semibold text-white">{percentage}%</span> complete. Please add: <span className="text-zinc-400">{missingFields.join(", ")}</span>.
        </div>
      </div>
      <Link
        href="/me/edit"
        className="text-xs bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap text-center"
      >
        Complete Profile
      </Link>
    </div>
  );
}
