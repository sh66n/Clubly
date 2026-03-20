import { connectToDb } from "@/lib/connectToDb";
import { Registration } from "@/models/registration.model";
import { Group } from "@/models/group.model";
import { Types } from "mongoose";

export async function getEventsRegisteredByUser(userId: string) {
  if (!Types.ObjectId.isValid(userId)) return 0;

  await connectToDb();
  const userObjectId = new Types.ObjectId(userId);

  const groups = await Group.find({ members: userObjectId }, { _id: 1 }).lean();
  const groupIds = groups.map((g) => g._id);

  const filter =
    groupIds.length > 0
      ? {
          status: "registered",
          $or: [{ userId: userObjectId }, { groupId: { $in: groupIds } }],
        }
      : { status: "registered", userId: userObjectId };

  const eventIds = await Registration.distinct("eventId", filter);

  return eventIds.length;
}
