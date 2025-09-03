import { IEvent } from "@/models/event.schema";
import React from "react";
import EventCard from "./EventCard";

interface EventGridProps {
  events: IEvent[];
  user: { _id: string; name: string; email: string };
}

export default function EventGrid({ events, user }: EventGridProps) {
  return (
    <div className="grid grid-cols-4">
      {events.map((event, idx) => (
        <EventCard key={event._id} event={event} user={user} />
      ))}
    </div>
  );
}
