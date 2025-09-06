import UserCard from "@/components/Events/UserCard";
import WinnerAssigner from "@/components/Events/WinnerAssigner";
import React from "react";

const getParticipants = async (eventId) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}/participants`,
    { method: "GET" }
  );
  if (!res.ok) return null;
  const { participants } = await res.json();
  return participants;
};

export default async function AssignWinner({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const participants = await getParticipants(eventId);

  return (
    <div>
      <h1 className="text-5xl font-semibold">Assign winner</h1>
      <WinnerAssigner participants={participants} eventId={eventId} />
    </div>
  );
}
