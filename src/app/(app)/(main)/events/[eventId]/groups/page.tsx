import React from "react";
import GroupSearchWrapper from "@/components/Groups/GroupSearchWrapper";
import BackButton from "@/components/BackButton";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Group } from "@/models";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const session = await auth();
  const { eventId } = await params;

  if (!session?.user) {
    redirect(`/login?callbackUrl=/events/${eventId}/groups`);
  }

  await connectToDb();

  const event = await Event.findById(eventId).select("name").lean();
  if (!event) {
    notFound();
  }

  const groups = await Group.find({ event: eventId })
    .populate("members", "name email image")
    .populate("leader", "name email image")
    .lean();

  const serializedGroups = JSON.parse(JSON.stringify(groups));

  return (
    <div>
      <BackButton link={`/events/${eventId}`} />
      <h1 className="text-5xl font-semibold mt-4">Groups</h1>
      <div className="my-2 text-[#717171] mb-4">
        All participant groups for {event.name ? `"${event.name}"` : "this event"}
      </div>
      <div className="mt-12">
        <GroupSearchWrapper initialGroups={serializedGroups ?? []} eventId={eventId} />
      </div>
    </div>
  );
}
