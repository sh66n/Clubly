"use client";

import { IEvent } from "@/models/event.schema";
import { Users, MapPin, Calendar, ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface EventCardProps {
  event: IEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);

  const currentRegs = Number((event as any).registrationCount ?? 0);
  const isFull =
    event.maxRegistrations > 0 && currentRegs >= event.maxRegistrations;

  return (
    <Link
      href={`/events/${event._id}`}
      className="group relative flex flex-col bg-[#0A0A0A] border border-[#1A1A1A] rounded-2xl overflow-hidden transition-all duration-500 hover:border-gray-500 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)]"
    >
      {/* Image Section with Gradient Overlay */}
      <div className="relative h-55 w-full overflow-hidden">
        <img
          src={event.image || "/images/default.png"}
          alt={event.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-60" />

        {/* Floating Club Tag */}
        {event.organizingClub.name && (
          <div className="absolute top-3 left-3">
            <span
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-white/10 backdrop-blur-md bg-black/40 text-white`}
            >
              {event.organizingClub.name}
            </span>
          </div>
        )}

        {/* Full Tag */}
        {isFull && (
          <div className="absolute top-3 right-3 z-10 transition-opacity duration-300 group-hover:opacity-0">
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border border-red-500/30 backdrop-blur-lg bg-red-500/20 text-red-500 shadow-sm">
              Full
            </span>
          </div>
        )}

        {/* Hover Arrow Indicator */}
        <div className="absolute top-3 right-3 p-2 rounded-full bg-white text-black opacity-0 -translate-y-2 translate-x-2 group-hover:opacity-100 group-hover:translate-y-0 group-hover:translate-x-0 transition-all duration-300">
          <ArrowUpRight size={16} strokeWidth={3} />
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col gap-3">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight line-clamp-1 group-hover:underline">
            {event.name}
          </h3>
          <div className="flex items-center gap-2 mt-1 text-gray-500">
            <Calendar size={12} />
            <span className="text-[11px] font-medium uppercase tracking-wider">
              {eventDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}{" "}
              •{" "}
              {eventDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Bottom Metadata Row */}
        <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#1A1A1A]">
          <div className="flex items-center gap-1.5 text-gray-400">
            <Users size={14} className="text-gray-600" />
            <span className="text-xs font-bold font-mono">
              {currentRegs}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-gray-500">
            <MapPin size={14} />
            <span className="text-[11px] font-semibold tracking-wide uppercase">
              TBD
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
