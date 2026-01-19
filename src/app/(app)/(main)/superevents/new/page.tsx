import { auth } from "@/auth";
import BackButton from "@/components/BackButton";
import NewSuperEventForm from "@/components/SuperEvents/NewSuperEventForm";
import React from "react";

export default async function NewSuperEvent() {
  const session = await auth();
  return (
    <div>
      <BackButton link={"/events"} />
      <NewSuperEventForm organizingClubId={session?.user?.adminClub} />
    </div>
  );
}
