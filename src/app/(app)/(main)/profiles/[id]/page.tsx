import React from "react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { getUserById } from "@/services/getUserById";
import { getEventsAttendedByUser } from "@/services/getEventsAttendedByUser";
import { getUserCertificates } from "@/services/getUserCertificates";
import { getUserBadges } from "@/services/getUserBadges";
import { getUserSocialNetwork } from "@/services/getUserSocialNetwork";
import { getUserActivityData } from "@/services/getUserActivity";
import { getUserProfileStreakCard } from "@/services/getUserProfileStreakCard";
import { calculateGamificationStats } from "@/lib/gamification";
import { UserPoints } from "@/models";
import "@/models";
import ProfileClient from "@/components/Profile/ProfileClient";
import mongoose from "mongoose";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const currentUserId = session?.user?.id;

  const { id } = await params;
  const user = await getUserById(id);

  if (!user) {
    notFound();
  }

  // Compute total points across all clubs
  const totalPoints =
    user.points?.reduce((sum: number, p: any) => sum + (p.points || 0), 0) ?? 0;

  // Calculate global rank among all students with points
  let globalRank: number | string = "—";
  try {
    if (totalPoints > 0) {
      const higherScoreCount = await UserPoints.aggregate([
        { $group: { _id: "$userId", total: { $sum: "$points" } } },
        { $match: { total: { $gt: totalPoints } } },
        { $count: "count" },
      ]);
      globalRank = (higherScoreCount[0]?.count || 0) + 1;
    } else {
      globalRank = "Unranked";
    }
  } catch (err) {
    globalRank = totalPoints > 0 ? 1 : "Unranked";
  }

  // Concurrently fetch event badges, certificates, social stats, activity, and streak card popup
  const [eventsAttended, certificates, badges, socialStats, activityData, profileStreakCard] = await Promise.all([
    getEventsAttendedByUser(user._id.toString()),
    getUserCertificates(user._id.toString()),
    getUserBadges(user._id.toString()),
    getUserSocialNetwork(user._id.toString(), currentUserId),
    getUserActivityData(user._id.toString()),
    getUserProfileStreakCard(user._id.toString()),
  ]);

  const gamification = calculateGamificationStats(totalPoints);

  // Clean serializable user object for client component
  const serializableUser = {
    _id: user._id?.toString(),
    name: user.name || "Student",
    email: user.email || "",
    image: user.image || "/images/default.png",
    role: user.role || "user",
    college: user.college || "PVPPCOE Mumbai",
    department: user.department || "Computer Engineering",
    year: user.year,
    division: user.division,
    phone: user.phone || user.phoneNumber,
    personalMail: user.personalMail,
    address: user.address,
    bio: user.bio,
  };

  return (
    <ProfileClient
      user={serializableUser}
      gamification={gamification}
      badges={badges}
      certificates={certificates}
      socialStats={socialStats}
      eventsAttended={eventsAttended}
      activityData={activityData}
      globalRank={globalRank}
      currentUserId={currentUserId}
      streakCardData={profileStreakCard}
    />
  );
}
