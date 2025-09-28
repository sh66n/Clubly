import { auth } from "@/auth";
import NewEventForm from "@/components/Events/NewEventForm";
import React from "react";

export default async function NewEventPage() {
  const session = await auth();
  return (
    <div>
      <NewEventForm user={session?.user} />
    </div>
  );
}
