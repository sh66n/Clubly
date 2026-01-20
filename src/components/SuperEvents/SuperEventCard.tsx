"use client";

import Link from "next/link";
import { ArrowUpRight, CalendarRange } from "lucide-react";
import { ISuperEvent } from "@/models/superevent.model";

interface SuperEventCardProps {
  superEvent: ISuperEvent & {
    organizingClub: {
      _id: string;
      name: string;
    };
  };
}

export default function SuperEventCard({ superEvent }: SuperEventCardProps) {
  const startDate = superEvent.startDate
    ? new Date(superEvent.startDate)
    : null;
  const endDate = superEvent.endDate ? new Date(superEvent.endDate) : null;

  const formattedDate =
    startDate && endDate
      ? `${startDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} – ${endDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}`
      : "Dates TBA";

  return (
    <Link
      href={`/superevents/${superEvent._id}`}
      className="group flex flex-col bg-black border border-[#2A2A2A] rounded-xl overflow-hidden hover:border-gray-500 transition-colors duration-200"
    >
      {/* Image Section */}
      <div className="relative h-40 w-full">
        <img
          src={superEvent.image || "/images/default.png"}
          alt={superEvent.name}
          className="w-full h-full object-cover"
        />

        {/* Simple Square Tag */}
        {superEvent.organizingClub?.name && (
          <div className="absolute top-2 left-2">
            <span className="px-2 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest border border-[#2A2A2A]">
              {superEvent.organizingClub.name}
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
        <div className="flex justify-between items-start gap-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-tight group-hover:underline">
            {superEvent.name}
          </h3>
          <span className="text-[9px] text-gray-400 font-bold uppercase border border-gray-800 px-1.5 py-0.5">
            Super
          </span>
        </div>

        {superEvent.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {superEvent.description}
          </p>
        )}

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
