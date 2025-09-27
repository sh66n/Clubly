import WinnerAssigner from "@/components/Events/WinnerAssigner";
import { getEventType } from "@/services/getEventType";
import { getParticipants } from "@/services/getParticipants";
import { getEvent } from "@/services/getEvent";
import React from "react";

export default async function AssignWinner({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const eventType = await getEventType(eventId);
  const rawParticipants = await getParticipants(eventId, eventType);
  const event = await getEvent(eventId);

  // Convert current winner to plain object
  let currentWinner = null;
  if (eventType === "team" && event.winnerGroup) {
    const group = event.winnerGroup;
    currentWinner = {
      _id: group._id.toString(),
      name: group.name,
      isPublic: group.isPublic,
      leader: {
        _id: group.leader._id.toString(),
        name: group.leader.name,
        email: group.leader.email,
        image: group.leader.image,
      },
      members: group.members.map((m: any) => ({
        _id: m._id.toString(),
        name: m.name,
        email: m.email,
        image: m.image,
      })),
    };
  } else if (eventType === "individual" && event.winner) {
    const user = event.winner;
    currentWinner = {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
    };
  }

  // Convert participants to plain objects
  const participants = rawParticipants.map((p: any) => {
    if (eventType === "team") {
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
      <h1 className="text-5xl font-semibold mb-6">Assign Winner</h1>
      <WinnerAssigner
        participants={participants}
        eventId={eventId}
        eventType={eventType}
        currentWinner={currentWinner}
      />
    </div>
  );
}
