import { connectToDb } from "@/lib/connectToDb";
import { User } from "@/models";

export const getUserPoints = async (email) => {
  await connectToDb();
  const dbUser = await User.findOne({ email: email });
  const totalPoints = dbUser.points.reduce(
    (sum, entry) => sum + (entry.points || 0),
    0
  );

  return totalPoints;
};
