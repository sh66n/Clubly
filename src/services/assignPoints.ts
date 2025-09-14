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

  // ✅ Handle present
  for (const item of present) {
    if (event.eventType === "team" && item.members) {
      // Add group to participantGroups if not already
      if (!event.participantGroups.includes(item._id as any)) {
        event.participantGroups.push(new mongoose.Types.ObjectId(item._id));
      }
      // Award points to each member
      await processUsers(
        item.members.map((m) => m._id),
        10
      );
    } else {
      // Individual
      if (!event.participants.includes(item._id as any)) {
        event.participants.push(new mongoose.Types.ObjectId(item._id));
      }
      await processUsers([item._id], 10);
    }
  }

  // ✅ Handle absent
  for (const item of absent) {
    if (event.eventType === "team" && item.members) {
      // Remove group from participantGroups
      event.participantGroups = event.participantGroups.filter(
        (g) => g.toString() !== item._id
      );
      // Deduct points from each member
      await processUsers(
        item.members.map((m) => m._id),
        -10
      );
    } else {
      // Individual
      event.participants = event.participants.filter(
        (p) => p.toString() !== item._id
      );
      await processUsers([item._id], -10);
    }
  }

  await event.save();
  return event;
}
