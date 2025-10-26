import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models/user.model";
import { Types } from "mongoose";

/**
 * Fetch a user by their ID
 * @param id - string or ObjectId
 * @returns IUser document or null
 */
export async function getUserById(id: string | Types.ObjectId) {
  if (!Types.ObjectId.isValid(id)) return null;

  try {
    await connectToDb();
    const user = await User.findById(id);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
