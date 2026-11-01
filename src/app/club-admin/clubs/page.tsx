import React from "react";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { connectToDb } from "@/lib/connectToDb";
import { Club, ClubMember, Event } from "@/models";
import { runWithoutTenantFilter } from "@/lib/tenantPlugin";
import ClubEditClient from "./ClubEditClient";

export const metadata = {
  title: "My Club Profile | Club Admin",
  description: "View and edit club profile, name, logo, and department.",
};

export default async function ClubAdminClubsPage() {
  const session = await auth();

  if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
    redirect("/login?callbackUrl=/club-admin/clubs");
  }

  await connectToDb();

  const clubId = session.user.adminClub;

  const club: any = await runWithoutTenantFilter(() =>
    Club.findById(clubId)
      .populate("facultyCoordinator", "name email image department phoneNumber")
      .lean()
  );

  if (!club) {
    notFound();
  }

  const [eventsCount, coreCount, volunteerCount] = await Promise.all([
    Event.countDocuments({ organizingClub: clubId }),
    ClubMember.countDocuments({ clubId, role: "core" }),
    ClubMember.countDocuments({ clubId, role: "volunteer" }),
  ]);

  const serializedClub = JSON.parse(
    JSON.stringify({
      ...club,
      eventsCount,
      coreCount,
      volunteerCount,
      totalMembers: coreCount + volunteerCount,
      followersCount: club.followers?.length || 0,
      bellFollowersCount: club.bellFollowers?.length || 0,
    })
  );

  return <ClubEditClient initialClub={serializedClub} />;
}
