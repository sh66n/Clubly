import { auth } from "@/auth";
import EventDetails from "@/components/Events/EventDetails";
import EventInsights from "@/components/Events/EventInsights";
import { headers } from "next/headers";
import React from "react";

const getEventDetails = async (eventId) => {
  const nextHeaders = await headers();
  const cookieHeader = nextHeaders.get("cookie") ?? "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}`,
    {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );
  if (!res.ok) return null;

  const { event, myGroup } = await res.json();
  return { event, myGroup };
};

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;
  const { event, myGroup } = await getEventDetails(eventId);

  return (
    <>
      <div className="h-full">
        <EventDetails event={event} group={myGroup} />
        {session?.user.role === "club-admin" &&
          session?.user.adminClub?.toString() ===
            event.organizingClub._id.toString() && (
            <EventInsights event={event} />
          )}
      </div>
    </>
  );
}
