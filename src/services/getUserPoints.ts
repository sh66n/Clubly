import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models";

export const getUserPoints = async (email) => {
  if (!email) return null;

  await connectToDb();

  const dbUser = await User.findOne({ email: email });
  if (!dbUser) return null;

  const totalPoints = dbUser.points.reduce(
    (sum, entry) => sum + (entry.points || 0),
    0
  );

  return totalPoints;
};
