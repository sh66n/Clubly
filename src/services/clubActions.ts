"use server";

import { connectToDb } from "@/lib/connectToDb";
import { Club } from "@/models";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function toggleFollowClub(clubId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDb();
  
  const club = await Club.findById(clubId);
  if (!club) throw new Error("Club not found");

  const userId = session.user.id;
  const isFollowing = club.followers?.includes(userId);

  if (isFollowing) {
    club.followers = club.followers.filter((id: any) => id.toString() !== userId);
    if (club.bellFollowers) {
      club.bellFollowers = club.bellFollowers.filter((id: any) => id.toString() !== userId);
    }
  } else {
    if (!club.followers) club.followers = [];
    club.followers.push(userId);
  }
  
  await club.save();
  revalidatePath(`/clubs/${clubId}`);
  return isFollowing ? "unfollowed" : "followed";
}

export async function toggleBellClub(clubId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDb();
  
  const club = await Club.findById(clubId);
  if (!club) throw new Error("Club not found");

  const userId = session.user.id;
  const isFollowing = club.followers?.includes(userId);
  
  if (!isFollowing) {
    throw new Error("Must follow club before enabling notifications");
  }

  const hasBell = club.bellFollowers?.includes(userId);

  if (hasBell) {
    club.bellFollowers = club.bellFollowers.filter((id: any) => id.toString() !== userId);
  } else {
    if (!club.bellFollowers) club.bellFollowers = [];
    club.bellFollowers.push(userId);
  }
  
  await club.save();
  revalidatePath(`/clubs/${clubId}`);
  return hasBell ? "bell_off" : "bell_on";
}
