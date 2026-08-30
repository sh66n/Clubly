"use client";

import React from "react";
import HackathonCard from "./HackathonCard";

interface HackathonGridProps {
  hackathons: any[];
}

export default function HackathonGrid({ hackathons }: HackathonGridProps) {
  if (!hackathons || hackathons.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No hackathons found</h3>
        <p className="text-gray-500 max-w-md mx-auto">
          There are currently no hackathons matching your search. Check back later or adjust your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {hackathons.map((hackathon) => (
        <HackathonCard key={hackathon._id} hackathon={hackathon} />
      ))}
    </div>
  );
}
