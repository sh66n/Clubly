import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";
import { Types } from "mongoose";

export async function getEventsAttendedByUser(userId: string) {
  await connectToDb();
  return Event.countDocuments({
    participants: new Types.ObjectId(userId),
  });
}
