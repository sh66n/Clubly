import EditGroupForm from "@/components/Groups/EditGroupForm";
import { headers } from "next/headers";
import { auth } from "@/auth";
import React from "react";
import { redirect } from "next/navigation";

const getGroup = async (eventId: string, groupId: string) => {
  const nextHeaders = await headers();
  const cookieHeader = nextHeaders.get("cookie") ?? "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}/groups/${groupId}`,
    {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  return res.json();
};

export default async function EditGroup({
  params,
}: {
  params: Promise<{ eventId: string; groupId: string }>;
}) {
  const { eventId, groupId } = await params;
  const group = await getGroup(eventId, groupId);

  const session = await auth();
  if (!session?.user?.id) return <div>Please login to edit this group</div>;

  if (group.leader._id.toString() !== session.user.id) {
    redirect("/forbidden");
  }

  if (!group)
    return (
      <div className="text-gray-500 p-10 text-center">Group not found</div>
    );

  return (
    <EditGroupForm
      eventId={eventId}
      groupId={groupId}
      initialName={group.name}
      initialIsPublic={group.isPublic}
    />
  );
}
