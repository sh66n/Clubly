import PodiumSkeleton from "@/components/Leaderboard/PodiumSkeleton";
import TableSkeleton from "@/components/Leaderboard/TableSkeleton";
import React from "react";

export default function Loading() {
  return (
    <div className="w-full h-full grow">
      <PodiumSkeleton />
      <TableSkeleton />
    </div>
  );
}
