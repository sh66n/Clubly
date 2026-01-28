import { IEvent } from "@/models/event.schema";
import React from "react";
import EventCard from "./EventCard";
import { ISuperEvent, SuperEvent } from "@/models/superevent.model";
import SuperEventCard from "../SuperEvents/SuperEventCard";

interface EventGridProps {
  events: IEvent[];
  superEvents?: ISuperEvent[];
  detailed?: boolean;
}

export default function EventGrid({
  events,
  superEvents,
  detailed = true,
}: EventGridProps) {
  if (!events || events.length === 0) {
    return <div className="text-[#6D6D6D] my-6">No events found.</div>;
  }

  const now = new Date();

  const upcomingEvents = events.filter((event) => new Date(event.date) >= now);
  const completedEvents = events.filter((event) => new Date(event.date) < now);

  const gridClasses =
    "grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  if (!detailed) {
    return (
      <div className={`${gridClasses} w-full`}>
        {events.map((event) => (
          <EventCard key={event._id} event={event} />
        ))}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 flex flex-col gap-8">
      {/* Super Events */}
      {superEvents && superEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mt-4 mb-8">
            Featured Experiences
          </h2>
          <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {superEvents.map((superEvent) => (
              <SuperEventCard key={superEvent._id} superEvent={superEvent} />
            ))}
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mt-4 mb-8">Upcoming</h2>
          <div className={gridClasses}>
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}

      {/* Completed Events */}
      {completedEvents.length > 0 && (
        <section>
          <h2 className="text-2xl font-semibold mt-4 mb-8">Completed</h2>
          <div className={gridClasses}>
            {completedEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
