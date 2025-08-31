import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";
import { Types } from "mongoose";

export async function getEventsRegisteredByUser(userId: string) {
  await connectToDb();
  return Event.countDocuments({
    registrations: new Types.ObjectId(userId),
  });
}
