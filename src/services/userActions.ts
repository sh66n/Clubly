"use server";

import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

/**
 * Toggle following a student/user
 * @param targetUserId - ID of the user to follow/unfollow
 */
export async function toggleFollowUser(targetUserId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const currentUserId = session.user.id;
  if (currentUserId === targetUserId) {
    throw new Error("You cannot follow yourself");
  }

  if (
    !mongoose.Types.ObjectId.isValid(targetUserId) ||
    !mongoose.Types.ObjectId.isValid(currentUserId)
  ) {
    throw new Error("Invalid user ID");
  }

  await connectToDb();

  const currentUserObjId = new mongoose.Types.ObjectId(currentUserId);
  const targetUserObjId = new mongoose.Types.ObjectId(targetUserId);

  const targetUser = await User.findById(targetUserObjId);
  if (!targetUser) throw new Error("Target user not found");

  const isFollowing = targetUser.followers?.some(
    (id: any) => id.toString() === currentUserId,
  );

  if (isFollowing) {
    // Unfollow: remove current user from target's followers & remove target from current's following
    await Promise.all([
      User.findByIdAndUpdate(targetUserObjId, {
        $pull: { followers: currentUserObjId },
      }),
      User.findByIdAndUpdate(currentUserObjId, {
        $pull: { following: targetUserObjId },
      }),
    ]);
  } else {
    // Follow: add to followers & following
    await Promise.all([
      User.findByIdAndUpdate(targetUserObjId, {
        $addToSet: { followers: currentUserObjId },
      }),
      User.findByIdAndUpdate(currentUserObjId, {
        $addToSet: { following: targetUserObjId },
      }),
    ]);
  }

  revalidatePath(`/profiles/${targetUserId}`);
  revalidatePath(`/profiles/${currentUserId}`);

  return isFollowing ? "unfollowed" : "followed";
}
