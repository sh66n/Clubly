import EditGroupForm from "@/components/Groups/EditGroupForm";
import { auth } from "@/auth";
import React from "react";
import { notFound, redirect } from "next/navigation";
import { connectToDb } from "@/lib/connectToDb";
import { Group } from "@/models";

export default async function EditGroup({
  params,
}: {
  params: Promise<{ eventId: string; groupId: string }>;
}) {
  const { eventId, groupId } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/events/${eventId}/groups/${groupId}/edit`);
  }

  await connectToDb();

  const group = await Group.findById(groupId).lean();

  if (!group || group.event?.toString() !== eventId) {
    return <div className="text-gray-500 p-10 text-center">Group not found</div>;
  }

  if (group.leader.toString() !== session.user.id) {
    redirect("/forbidden");
  }

  return (
    <EditGroupForm
      eventId={eventId}
      groupId={groupId}
      initialName={group.name}
      initialIsPublic={group.isPublic}
    />
  );
}
