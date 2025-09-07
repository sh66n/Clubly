import React from "react";
import { headers } from "next/headers";

export default async function PublicGroupsPage() {
  // Get cookies/headers from the incoming request
  const nextHeaders = await headers();
  const cookieHeader = nextHeaders.get("cookie") ?? "";

  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/events/68b6d5e84036c30660e4440b/groups`,
    {
      method: "POST",
      headers: {
        cookie: cookieHeader, // ✅ forward cookies to API
      },
      cache: "no-store", // optional: always fresh data
    }
  );

  const creds = await res.json();

  return (
    <div>
      <h1>PublicGroupsPage</h1>
    </div>
  );
}
