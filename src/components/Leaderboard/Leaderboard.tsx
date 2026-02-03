import React from "react";
import Table from "./Table";
import Podium from "./Podium";
import { Trophy } from "lucide-react"; // Optional: Using lucide-react for a clean icon

export default function Leaderboard({ topUsers = [] }) {
  const hasMinData = topUsers.length >= 3;

  return (
    <div className="w-full h-full grow">
      {hasMinData ? (
        <div className="w-full h-full animate-in fade-in duration-700">
          <Podium topThree={topUsers.slice(0, 3)} />
          <Table topUsers={topUsers} />
        </div>
      ) : (
        <div className="w-full h-full grow p-4">
          <EmptyState />
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full grow space-y-4 border-2 border-dashed border-zinc-800 rounded-lg p-12 bg-[#0a0a0a]">
      <div className="p-4 bg-zinc-900 rounded-full text-zinc-500">
        <Trophy size={48} strokeWidth={1} />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-medium text-zinc-200">
          Gathering Rankings
        </h3>
        <p className="text-zinc-500 max-w-[240px] mt-2 text-sm">
          We need at least 3 participants to establish the podium. Check back
          soon!
        </p>
      </div>
    </div>
  );
}
