import { auth } from "@/auth";
import EventDetails from "@/components/Events/EventDetails";
import EventInsights from "@/components/Events/EventInsights";
import React from "react";

const getEventDetails = async (eventId) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}`,
    { method: "GET" }
  );
  if (!res.ok) return null;

  const { event } = await res.json();
  return event;
};

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;
  const event = await getEventDetails(eventId);

  return (
    <>
      <div className="h-full">
        <EventDetails event={event} />
        {session?.user.role === "club-admin" &&
          session?.user.adminClub?.toString() ===
            event.organizingClub._id.toString() && (
            <EventInsights event={event} />
          )}
      </div>
    </>
  );
}
