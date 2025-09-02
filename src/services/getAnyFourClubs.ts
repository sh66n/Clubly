import { Club } from "@/models/club.model";

export async function getAnyFourClubs() {
  return Club.find({}, "_id name logo").limit(4);
}
