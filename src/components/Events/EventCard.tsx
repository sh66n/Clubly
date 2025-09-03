"use client";

import { IEvent } from "@/models/event.schema";
import { Heart, Users } from "lucide-react";

interface EventCardProps {
  event: IEvent;
  user: { id: string; name: string; email: string };
}

export default function EventCard({ event, user }: EventCardProps) {
  const eventDate = new Date(event.date);
  const handleRegister = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId: event._id, userId: user.id }),
      }
    );

    if (!res.ok) {
      throw new Error("Failed to register");
    }

    const updatedEvent = await res.json();
    console.log(updatedEvent);
  };
  return (
    <div className="bg-black text-white rounded-xl overflow-hidden shadow-md w-64 border border-[#515151]">
      {/* Image Section */}
      <div className="relative">
        <img
          src={event.image}
          alt="Event"
          className="w-full h-40 object-cover"
        />

        {/* Top Left - Likes */}
        <div className="absolute top-2 left-2 flex items-center gap-1 text-xs bg-black/50 px-2 py-1 rounded-full">
          <Heart size={14} className="text-white" />
          <span>21</span>
        </div>

        {/* Top Right - Tag */}
        <span className="absolute top-2 right-2 bg-red-500 text-xs font-semibold px-2 py-1 rounded-full">
          {event.organizingClub.name}
        </span>
      </div>

      {/* Content Section */}
      <div className="p-3 flex flex-col gap-1">
        {/* Title */}
        <div className="flex justify-between">
          <h3 className="font-semibold text-base">{event.name}</h3>
          <span className="bg-orange-500 text-black font-semibold px-2 py-0.5 rounded-full text-[10px] h-fit">
            Competition
          </span>
        </div>

        {/* Date & Time */}

        {/* Bottom Row */}
        <div className="flex justify-between items-center text-xs mt-1">
          <p className="text-xs text-gray-400">
            {eventDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </p>
          {/* Room */}
          <span className="text-gray-400">Room 316</span>
        </div>

        {/* Participants */}

        <div className="flex items-center gap-1 text-xs text-gray-300 mt-1">
          <Users size={14} />
          <span>31</span>
        </div>
        <button onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}
