import { auth } from "@/auth";
import BorderedDiv from "@/components/BorderedDiv";
import EventDetails from "@/components/Events/EventDetails";
import { ArrowRight, ChartNoAxesColumn } from "lucide-react";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
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
    },
  );

  if (res.status === 401) {
    redirect(`/login?callbackUrl=/events/${eventId}`);
  }

  if (!res.ok) return null;

  const { event, myGroup, alreadyRegistered } = await res.json();
  return { event: { ...event, alreadyRegistered }, myGroup };
};

export default async function EventDetailsPage({
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

  const { event, myGroup } = data;

  return (
    <>
      <div className="h-full">
        <EventDetails event={event} group={myGroup} user={session?.user} />
        {session?.user.role === "club-admin" &&
          session?.user.adminClub?.toString() ===
            event.organizingClub._id.toString() && (
            <div className="mt-4">
              <h2 className="text-xl mb-2">Event Insights</h2>
              <BorderedDiv className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <p className="text-sm text-[#8D8D8D]">
                    Open the dedicated analytics view for attendance,
                    conversion, payments, and registration behavior.
                  </p>
                </div>
                <Link
                  href={`/events/${event._id.toString()}/insights`}
                  className="inline-flex items-center gap-2 bg-[#5E77F5] text-white px-4 py-2 rounded-lg hover:opacity-90 w-fit"
                >
                  <ChartNoAxesColumn size={16} />
                  Open Insights
                  <ArrowRight size={16} />
                </Link>
              </BorderedDiv>
            </div>
          )}
      </div>
    </>
  );
}
