import React from "react";
import { headers } from "next/headers";
import GroupGrid from "@/components/Groups/GroupGrid";

const getAllGroups = async (eventId) => {
  const nextHeaders = await headers();
  const cookieHeader = nextHeaders.get("cookie") ?? "";

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/events/${eventId}/groups`,
    {
      method: "GET",
      headers: {
        cookie: cookieHeader, // ✅ forward cookies to API
      },
      cache: "no-store", // optional: always fresh data
    }
  );

  if (!res.ok) return null;

  const allGroups = await res.json();
  return allGroups;
};

export default async function GroupsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  const allGroups = await getAllGroups(eventId);

  return (
    <div>
      <GroupGrid groups={allGroups} />
    </div>
  );
}
