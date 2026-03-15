import { Event, User, Group } from "@/models";
import mongoose from "mongoose";

export async function assignPointsForEvent(
  eventId: string,
  present: { _id: string; members?: { _id: string }[] }[],
  absent: { _id: string; members?: { _id: string }[] }[]
) {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const clubId = event.organizingClub;

  // Helper to ensure user has a points record for this club
  async function ensureClubPoints(userId: string) {
    await User.updateOne(
      { _id: userId, "points.clubId": { $ne: clubId } },
      { $push: { points: { clubId, points: 0 } } }
    );
  }

  // Helper to process a list of user IDs
  async function processUsers(users: string[], addPoints: number) {
    for (const userId of users) {
      await ensureClubPoints(userId);
      await User.findByIdAndUpdate(
        userId,
        { $inc: { "points.$[elem].points": addPoints } },
        { arrayFilters: [{ "elem.clubId": clubId }] }
      );
    }
  }

  const presentIds = present.map(p => new mongoose.Types.ObjectId(p._id));
  const absentIds = absent.map(p => p._id);

  // 1. Process points for present users
  for (const item of present) {
    const userIds = event.eventType === "team" && item.members 
      ? item.members.map(m => m._id) 
      : [item._id];
    await processUsers(userIds, 10);
  }

  // 2. Process points for absent users
  for (const item of absent) {
    const userIds = event.eventType === "team" && item.members 
      ? item.members.map(m => m._id) 
      : [item._id];
    await processUsers(userIds, -10);
  }

  // 3. Atomically update the Event document
  if (event.eventType === "team") {
    return await Event.findByIdAndUpdate(
      eventId,
      {
        $addToSet: { participantGroups: { $each: presentIds } },
        $pullAll: { participantGroups: absentIds }
      },
      { new: true }
    );
  } else {
    return await Event.findByIdAndUpdate(
      eventId,
      {
        $addToSet: { participants: { $each: presentIds } },
        $pullAll: { participants: absentIds }
      },
      { new: true }
    );
  }
}
