import { auth } from "@/auth";
import EditEventForm from "@/components/Events/EditEventForm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import React from "react";

const getEventDetails = async (eventId) => {
  const nextHeaders = await headers();
  const cookieHeader = nextHeaders.get("cookie") ?? "";

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}`, {
    method: "GET",
    headers: {
      cookie: cookieHeader,
    },
    cache: "no-store",
  });
  if (!res.ok) return null;

  const { event } = await res.json();
  return { event };
};

export default async function EditEvent({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;

  if (!session?.user) {
    redirect(`/login?callbackUrl=/events/${eventId}/edit`);
  }

  const data = await getEventDetails(eventId);
  if (!data?.event) {
    notFound();
  }

  const organizingClubId = String(
    data.event.organizingClub?._id || data.event.organizingClub || "",
  );
  const userAdminClubId = String(session.user.adminClub || "");
  const isSuperAdmin = session.user.role === "admin";
  const isClubAdmin =
    session.user.role === "club-admin" &&
    organizingClubId.length > 0 &&
    userAdminClubId === organizingClubId;

  if (!isSuperAdmin && !isClubAdmin) {
    redirect("/forbidden");
  }

  return (
    <div>
      <EditEventForm user={session.user} event={data.event} />
    </div>
  );
}
