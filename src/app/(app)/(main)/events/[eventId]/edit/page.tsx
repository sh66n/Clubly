import { auth } from "@/auth";
import EditEventForm from "@/components/Events/EditEventForm";
import { getEvent } from "@/services/getEvent";
import { notFound, redirect } from "next/navigation";
import React from "react";

const getEventDetails = async (eventId: string) => {
  try {
    const event = await getEvent(eventId);
    return { event: JSON.parse(JSON.stringify(event)) };
  } catch (error) {
    return null;
  }
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
