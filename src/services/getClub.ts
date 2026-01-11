import { connectToDb } from "@/lib/connectToDb";
import { Club } from "@/models";

export const getClub = async (clubId: string) => {
  // Ensure database is connected
  await connectToDb();

  // Find club by ID and populate all referenced fields
  const club = await Club.findById(clubId)
    .populate("coreMembers") // populate User references
    .populate("volunteers") // populate User references
    .populate("events"); // populate Event references

  return club;
};
