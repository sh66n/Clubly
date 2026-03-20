import { connectToDb } from "@/lib/connectToDb";
import { User, UserPoints } from "@/models";

export const getUserPoints = async (email: string) => {
  if (!email) return null;

  await connectToDb();

  const dbUser = await User.findOne({ email: email });
  if (!dbUser) return null;

  const userPoints = await UserPoints.find({ userId: dbUser._id });
  const totalPoints = userPoints.reduce(
    (sum, entry) => sum + (entry.points || 0),
    0
  );

  return totalPoints;
};
