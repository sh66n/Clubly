import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";
import { Group } from "@/models/group.model";
import { Types } from "mongoose";

export async function getEventsAttendedByUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) return 0;

  await connectToDb();
  const userObjectId = new Types.ObjectId(userId);

  // Step 1: Find all groups the user is part of
  const groups = await Group.find({ members: userObjectId }, { _id: 1 }).lean();
  const groupIds = groups.map((g) => g._id);

  // Step 2: Count events where the user is a participant or in one of their groups
  return Event.countDocuments({
    $or: [
      { participants: userObjectId },
      { participantGroups: { $in: groupIds } },
    ],
  });
}
