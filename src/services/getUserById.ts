import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models/user.model";
import { UserPoints } from "@/models/userpoints.model";
import { Types } from "mongoose";

/**
 * Fetch a user by their ID
 * @param id - string or ObjectId
 * @returns IUser document with points or null
 */
export async function getUserById(id: string | Types.ObjectId) {
  if (!Types.ObjectId.isValid(id)) return null;

  try {
    await connectToDb();
    const user = await User.findById(id).lean();

    if (!user) return null;

    // Fetch user's points from UserPoints collection
    const userPoints = await UserPoints.find({ userId: id }).lean();

    // Return user with points attached (in the old format for compatibility)
    return {
      ...user,
      points: userPoints.map((up) => ({
        clubId: up.clubId,
        points: up.points,
      })),
    };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
