"use client";

import React, { useState } from "react";
import { Globe, Lock, ChevronDown, Crown, Users } from "lucide-react";
import UserCard from "../Events/UserCard";
import Link from "next/link";
import { ObjectId } from "mongoose";

interface Group {
  _id: string;
  name: string;
  isPublic: boolean;
  leader: {
    _id: string;
    name: string;
    email?: string;
    image?: string;
  };
  members?: {
    _id: string;
    name: string;
    email?: string;
    image?: string;
  }[];
}

interface GroupCardProps {
  group: Group;
  isExpanded?: boolean;
  eventId: string;
}

export default function GroupCard({
  group,
  isExpanded = false,
  eventId,
}: GroupCardProps) {
  const [expanded, setExpanded] = useState(isExpanded);
  const memberCount = group.members?.length || 0;

  return (
    <div
      className={`group transition-all duration-300 rounded-xl border h-fit ${
        expanded
          ? "bg-[#0A0A0A] border-gray-800 shadow-2xl"
          : "bg-black border-[#2A2A2A] hover:border-gray-700"
      }`}
    >
      {/* Header Area */}
      <div
        className="p-4 flex justify-between items-center cursor-pointer select-none"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-lg tracking-tight">
              <Link
                href={`/events/${eventId}/groups/${group._id}`}
                className="hover:underline"
                onClick={(e) => {
                  // This prevents the parent div's onClick (toggleExpand) from firing
                  e.stopPropagation();
                }}
              >
                {group.name}
              </Link>
            </h3>
            <span className="text-gray-600">
              {group.isPublic ? (
                <Globe size={14} className="text-green-500/80" />
              ) : (
                <Lock size={14} className="text-amber-500/80" />
              )}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              <Users size={12} className="text-gray-600" />
              {memberCount} Members
            </div>
          </div>
        </div>

        <div
          className={`transition-transform duration-300 ${expanded ? "rotate-180 text-white" : "text-gray-600"}`}
        >
          <ChevronDown size={20} />
        </div>
      </div>

      {/* Content Area */}
      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          expanded ? "max-h-[1000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-4 pb-4 space-y-4">
          <div className="h-px bg-[#2A2A2A] w-full" />

          {/* Leader Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 flex items-center gap-2">
              <Crown size={12} />
              Leader
            </label>
            <UserCard user={group.leader} />
          </div>

          {/* Members Section */}
          {memberCount > 1 && (
            <div className="space-y-2 pt-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                Team Members
              </label>
              <div className="grid gap-2">
                {group.members
                  ?.filter((m) => m._id !== group.leader._id)
                  .map((member) => (
                    <UserCard key={member._id} user={member} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
