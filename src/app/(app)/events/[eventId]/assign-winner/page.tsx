import UserCard from "@/components/Events/UserCard";
import WinnerAssigner from "@/components/Events/WinnerAssigner";
import { getEventType } from "@/services/getEventType";
import { getParticipants } from "@/services/getParticipants";
import React from "react";

export default async function AssignWinner({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  const rawParticipants = await getParticipants(eventId);
  const eventType = await getEventType(eventId);

  const participants = rawParticipants.map((p: any) => {
    if (eventType === "team") {
      // group object
      return {
        _id: p._id.toString(),
        name: p.name,
        isPublic: p.isPublic,
        leader: {
          _id: p.leader._id.toString(),
          name: p.leader.name,
          email: p.leader.email,
          image: p.leader.image,
        },
        members: p.members.map((m: any) => ({
          _id: m._id.toString(),
          name: m.name,
          email: m.email,
          image: m.image,
        })),
      };
    } else {
      // individual user object
      return {
        _id: p._id.toString(),
        name: p.name,
        email: p.email,
        image: p.image,
      };
    }
  });

  return (
    <div>
      <h1 className="text-5xl font-semibold">Assign winner</h1>
      <WinnerAssigner
        participants={participants}
        eventId={eventId}
        eventType={eventType}
      />
    </div>
  );
}
