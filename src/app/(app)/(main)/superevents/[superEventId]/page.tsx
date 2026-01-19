import BackButton from "@/components/BackButton";
import EventGrid from "@/components/Events/EventGrid";
import SuperEventDetails from "@/components/SuperEvents/SuperEventDetails";
import React from "react";

const fetchSuperEvent = async (id) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/superevents/${id}`,
  );
  if (!res.ok) return null;
  const data = await res.json();

  return data;
};

const fetchEvents = async (id) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/superevents/${id}/events`,
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data;
};

export default async function SuperEventPage({
  params,
}: {
  params: Promise<{ superEventId: string }>;
}) {
  const { superEventId } = await params;
  const superEvent = await fetchSuperEvent(superEventId);
  const eventsInSuperEvent = await fetchEvents(superEventId);

  return (
    <div className="">
      <BackButton link={"/events"} />
      <SuperEventDetails
        superEvent={superEvent}
        eventsInSuperEvent={eventsInSuperEvent}
      />

      <h3 className="mb-4 text-2xl">Events</h3>
      <EventGrid events={eventsInSuperEvent} detailed={false} />
    </div>
  );
}
