"use server";

import { connectToDb } from "@/lib/connectToDb";
import { Club, User } from "@/models";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function toggleFollowClub(clubId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await connectToDb();
  
  const club = await Club.findById(clubId);
  if (!club) throw new Error("Club not found");

  const userId = session.user.id;
  const isFollowing = club.followers?.some((id: any) => id.toString() === userId);
  const clubObjId = new mongoose.Types.ObjectId(clubId);
  const userObjId = new mongoose.Types.ObjectId(userId);

  if (isFollowing) {
    club.followers = club.followers.filter((id: any) => id.toString() !== userId);
    if (club.bellFollowers) {
      club.bellFollowers = club.bellFollowers.filter((id: any) => id.toString() !== userId);
    }
    await User.findByIdAndUpdate(userObjId, {
      $pull: { followingClubs: clubObjId },
    });
  } else {
    if (!club.followers) club.followers = [];
    club.followers.push(userObjId as any);
    await User.findByIdAndUpdate(userObjId, {
      $addToSet: { followingClubs: clubObjId },
    });
  }
  
  await club.save();
  revalidatePath(`/clubs/${clubId}`);
  revalidatePath(`/profiles/${userId}`);
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
