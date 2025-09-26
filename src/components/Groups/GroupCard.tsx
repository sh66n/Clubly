"use client";

import React, { useState } from "react";
import BorderedDiv from "../BorderedDiv";
import { Globe, Lock, ChevronDown, ChevronUp } from "lucide-react";
import UserCard from "../Events/UserCard";

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

interface AnimatedGroupCardProps {
  group: Group;
}

export default function GroupCard({ group }: AnimatedGroupCardProps) {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => setExpanded(!expanded);

  return (
    <div className="transition-all duration-300 shadow hover:shadow-lg cursor-pointer">
      {/* Header */}
      <div
        className="flex justify-between items-center mb-2"
        onClick={toggleExpand}
      >
        <div className="flex items-center gap-2">
          <span className="font-semibold text-lg">{group.name}</span>
          {group.isPublic ? <Globe size={16} /> : <Lock size={16} />}
        </div>
        <div className="flex items-center">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Leader */}
      <div className="flex flex-col gap-2 mb-2">
        <UserCard
          user={group.leader}
          action={<span className="text-xs text-[#717171]">Leader</span>}
        />
      </div>

      {/* Members (collapsible) */}
      <div
        className={`flex flex-col gap-2 overflow-hidden transition-all duration-500 ${
          expanded ? "max-h-96" : "max-h-0"
        }`}
      >
        {group.members
          ?.filter((m) => m._id !== group.leader._id)
          .map((member) => (
            <UserCard key={member._id} user={member} />
          ))}
      </div>
    </div>
  );
}
