"use client";

import React from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";

interface TeamCardProps {
  team: any;
  maxSize: number;
}

export default function TeamCard({ team, maxSize }: TeamCardProps) {
  const memberCount = team.members?.length || 1;
  const isFull = memberCount >= maxSize;

  const handleRequestJoin = () => {
    toast.success(`Request sent to join ${team.name}`);
  };

  return (
    <div className="border rounded-xl p-4 bg-white flex flex-col h-full hover:border-gray-300 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-semibold text-gray-900">{team.name}</h4>
          <p className="text-sm text-gray-500">Created by {team.leader?.name || "User"}</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
          <Users className="w-3 h-3" />
          {memberCount}/{maxSize}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-6 flex-1">
        {team.bio || "Looking for passionate members to build something awesome!"}
      </p>

      <button
        onClick={handleRequestJoin}
        disabled={isFull}
        className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
          isFull 
            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
            : "bg-blue-50 text-blue-600 hover:bg-blue-100"
        }`}
      >
        {isFull ? "Team Full" : "Request to Join"}
      </button>
    </div>
  );
}
