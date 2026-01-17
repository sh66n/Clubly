import { auth } from "@/auth";
import EditEventForm from "@/components/Events/EditEventForm";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
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

  const { event, myGroup, alreadyRegistered } = await res.json();
  return { event, myGroup, alreadyRegistered };
};

export default async function EditEvent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;
  const data = await getEventDetails(eventId);
  if (!data?.event) {
    notFound();
  }

  return (
    <div>
      <EditEventForm user={session?.user} event={data.event} />
    </div>
  );
}
