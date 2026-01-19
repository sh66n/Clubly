"use client";

import { getColorFromString } from "@/lib/utils";
import Link from "next/link";
import { CalendarRange } from "lucide-react";
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

  const colorClass = superEvent.organizingClub?._id
    ? getColorFromString(superEvent.organizingClub._id.toString())
    : "bg-gray-600";

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
      className="bg-black text-white rounded-xl overflow-hidden shadow-md w-full border border-[#515151] mb-2 flex flex-col"
    >
      {/* Image */}
      <div className="relative">
        <img
          src={superEvent.image || "/images/default.png"}
          alt="Super Event"
          className="w-full h-40 object-cover"
        />

        {/* Club Tag */}
        {superEvent.organizingClub?.name && (
          <span
            className={`absolute top-2 right-2 ${colorClass} text-xs font-semibold px-2 py-1 rounded-full border border-white`}
          >
            {superEvent.organizingClub.name}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1 grow">
        {/* Title */}
        <h3 className="font-semibold text-base line-clamp-1">
          {superEvent.name}
        </h3>

        {/* Description (optional) */}
        {superEvent.description && (
          <p className="text-xs text-gray-400 line-clamp-2">
            {superEvent.description}
          </p>
        )}

        {/* Bottom Row */}
        <div className="flex items-center justify-between text-xs text-gray-400 mt-auto">
          <div className="flex items-center gap-1">
            <CalendarRange size={14} />
            <span>{formattedDate}</span>
          </div>

          <span className="text-gray-400">Multi-Event</span>
        </div>
      </div>
    </Link>
  );
}
