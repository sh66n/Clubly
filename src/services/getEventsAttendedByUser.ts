import { connectToDb } from "@/lib/connectToDb";
import { Registration } from "@/models/registration.model";
import { Group } from "@/models/group.model";
import { Types } from "mongoose";

export async function getEventsAttendedByUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) return 0;

  await connectToDb();
  const userObjectId = new Types.ObjectId(userId);

  // Step 1: Find all groups the user is part of
  const groups = await Group.find({ members: userObjectId }, { _id: 1 }).lean();
  const groupIds = groups.map((g) => g._id);

  // Step 2: Count distinct events where user/group attendance is marked as attended
  const eventIds = await Registration.distinct("eventId", {
    status: "attended",
    $or: [{ userId: userObjectId }, { groupId: { $in: groupIds } }],
  });

  return eventIds.length;
}
