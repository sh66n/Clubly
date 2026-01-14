import { IEvent } from "@/models/event.schema";
import React from "react";
import EventCard from "./EventCard";
import { Session } from "next-auth";

import { toast } from "sonner";

interface EventGridProps {
  events: IEvent[];
  user: Session["user"]; // <- use the NextAuth type
}

export default function EventGrid({ events, user }: EventGridProps) {
  if (!events || events.length === 0)
    return <div className="text-[#6D6D6D] my-4">No events found.</div>;
  return (
    <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 py-6 px-2">
      {events.map((event, idx) => (
        <EventCard key={event._id} event={event} user={user} />
      ))}
    </div>
  );
}
