import { connectToDb } from "@/lib/connectToDb";
import { Registration } from "@/models/registration.model";
import { Group } from "@/models/group.model";
import { Types } from "mongoose";

export async function getEventsRegisteredByUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) return 0;

  await connectToDb();
  const userObjectId = new Types.ObjectId(userId);

  // 1️⃣ Find all groups the user is part of
  const groups = await Group.find({ members: userObjectId }, { _id: 1 }).lean();
  const groupIds = groups.map((g) => g._id);

  // 2️⃣ Count distinct events where user is currently registered individually OR via group
  const eventIds = await Registration.distinct("eventId", {
    status: "registered",
    $or: [{ userId: userObjectId }, { groupId: { $in: groupIds } }],
  });

  return eventIds.length;
}
