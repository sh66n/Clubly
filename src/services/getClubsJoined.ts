import { Club } from "@/models/club.model";
import { Types } from "mongoose";

export async function getClubsJoined(userId: string) {
  return Club.find({
    $or: [
      { coreMembers: new Types.ObjectId(userId) },
      { volunteers: new Types.ObjectId(userId) },
    ],
  }).select("name department logo");
}
