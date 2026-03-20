import { connectToDb } from "@/lib/connectToDb";
import { Club } from "@/models/club.model";

export async function getAnyFourClubs() {
  await connectToDb();
  return Club.find({}, "_id name logo").limit(4);
}
