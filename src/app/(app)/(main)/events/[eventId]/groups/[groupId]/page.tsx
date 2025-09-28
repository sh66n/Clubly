import BorderedDiv from "@/components/BorderedDiv";
import UserCard from "@/components/Events/UserCard";
import GroupCard from "@/components/Groups/GroupCard";
import JoinGroupForm from "@/components/Groups/JoinGroupForm";
import { Globe, Lock } from "lucide-react";
import { headers } from "next/headers";
import React from "react";

const getGroup = async (eventId, groupId) => {
  const nextHeaders = await headers();
  const cookieHeader = nextHeaders.get("cookie") ?? "";

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/events/${eventId}/groups/${groupId}`,
    {
      method: "GET",
      headers: {
        cookie: cookieHeader, // ✅ forward cookies to API
      },
      cache: "no-store", // optional: always fresh data
    }
  );

  if (!res.ok) return null;

  const group = await res.json();

  return group;
};

export default async function GroupDetails({
  params,
}: {
  params: Promise<{ eventId: string; groupId: string }>;
}) {
  const { eventId, groupId } = await params;
  const group = await getGroup(eventId, groupId);
  return (
    <div className="flex gap-8">
      <div className="flex-1">
        <GroupCard group={group} />
        <JoinGroupForm eventId={eventId} group={group} />
      </div>
      <div className="flex-1"></div>
    </div>
  );
}
