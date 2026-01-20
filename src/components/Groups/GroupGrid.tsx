"use client";

import React from "react";
import GroupCard from "./GroupCard";
import { Globe, Lock } from "lucide-react";

interface GroupGridProps {
  groups: any[];
  eventId: string;
}

export default function GroupGrid({ groups, eventId }: GroupGridProps) {
  if (!groups?.length) {
    return (
      <div className="py-12 border border-dashed border-[#1A1A1A] rounded-3xl text-center">
        <p className="text-gray-500 text-sm italic">
          No groups found in this category.
        </p>
      </div>
    );
  }

  const publicGroups = groups.filter((g) => g.isPublic);
  const privateGroups = groups.filter((g) => !g.isPublic);

  return (
    <div className="space-y-8">
      {/* --- Public Section --- */}
      {publicGroups.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-green-500/5 border border-green-500/10 rounded-full text-green-500/80 text-[10px] font-bold uppercase tracking-widest">
              <Globe size={12} /> Public groups
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicGroups.map((group) => (
              <GroupCard group={group} key={group._id} eventId={eventId} />
            ))}
          </div>
        </section>
      )}

      {/* --- Private Section --- */}
      {privateGroups.length > 0 && (
        <section>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/5 border border-amber-500/10 rounded-full text-amber-500/80 text-[10px] font-bold uppercase tracking-widest">
              <Lock size={12} /> Private Groups
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {privateGroups.map((group) => (
              <GroupCard group={group} key={group._id} eventId={eventId} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
