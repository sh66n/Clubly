import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";
import { Group } from "@/models/group.model";
import { Types } from "mongoose";

export async function getEventsRegisteredByUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) return 0;

  await connectToDb();
  const userObjectId = new Types.ObjectId(userId);

  // 1️⃣ Find all groups the user is part of
  const groups = await Group.find({ members: userObjectId }, { _id: 1 }).lean();
  const groupIds = groups.map((g) => g._id);

  // 2️⃣ Count events where user is registered individually OR via group
  return Event.countDocuments({
    $or: [
      { registrations: userObjectId },
      { groupRegistrations: { $in: groupIds } },
    ],
  });
}
