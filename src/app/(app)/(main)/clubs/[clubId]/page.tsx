import { auth } from "@/auth";
import ClubHeader from "@/components/Clubs/ClubHeader";
import ClubLogo from "@/components/Clubs/ClubLogo";
import Panorama from "@/components/Clubs/Panorama";
import EventGrid from "@/components/Events/EventGrid";
import { getClub } from "@/services/getClub";
import React from "react";

export default async function ClubDetails({
  params,
}: {
  params: Promise<{ clubId: string }>;
}) {
  const session = await auth();

  const { clubId } = await params;
  const club = await getClub(clubId);

  // This ensures only clean, serializable data goes to the Client Components
  const serializedEvents = JSON.parse(JSON.stringify(club.events || []));
  const serializedUser = session?.user
    ? JSON.parse(JSON.stringify(session.user))
    : null;

  return (
    <div className="h-full w-full">
      <Panorama />
      <ClubLogo club={club} />
      <ClubHeader club={club} />
      <EventGrid events={serializedEvents} user={serializedUser} />
    </div>
  );
}
