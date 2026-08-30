"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarRange } from "lucide-react";
import { IHackathon } from "@/models/hackathon.schema";

interface HackathonCardProps {
  hackathon: IHackathon & {
    organizingClub: {
      _id: string;
      name: string;
      logo?: string;
    };
    rounds?: any[];
  };
}

export default function HackathonCard({ hackathon }: HackathonCardProps) {
  // Format date range from hackathon createdAt or round deadlines
  const createdAt = hackathon.createdAt ? new Date(hackathon.createdAt) : null;
  const formattedDate = createdAt
    ? createdAt.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "Live Registration";

  return (
    <Link
      href={`/hackathons/${hackathon._id}`}
      className="group flex flex-col bg-black border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-gray-500 transition-colors duration-200"
    >
      {/* Image Section */}
      <div className="relative h-44 w-full bg-[#121212] overflow-hidden">
        <img
          src={hackathon.image || "/images/default.png"}
          alt={hackathon.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Club Tag */}
        {hackathon.organizingClub?.name && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest border border-[#2A2A2A]">
              {hackathon.organizingClub.name}
            </span>
          </div>
        )}

        {/* Hover Arrow Indicator */}
        <div className="absolute top-3 right-3 p-2 rounded-full bg-white text-black opacity-0 -translate-y-2 translate-x-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300">
          <ArrowUpRight size={16} strokeWidth={3} />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-sm font-bold text-white uppercase tracking-tight group-hover:underline line-clamp-1">
            {hackathon.name}
          </h3>
          <span className="text-[9px] text-gray-400 font-bold uppercase border border-gray-800 px-1.5 py-0.5 whitespace-nowrap">
            Hackathon
          </span>
        </div>

        {hackathon.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {hackathon.description}
          </p>
        )}

        {/* Divider + Dates Section */}
        <div className="flex items-center gap-2 mt-2 pt-3 border-t border-[#1A1A1A]">
          <CalendarRange size={14} className="text-gray-500" />
          <span className="text-[10px] font-medium text-gray-400 tracking-widest uppercase">
            {formattedDate}
          </span>
        </div>
      </div>
    </Link>
  );
}
