import { Event } from "@/models";
import { User } from "@/models";
import mongoose from "mongoose";

export async function assignPoints(
  eventId: string,
  present: { _id: string }[],
  absent: { _id: string }[]
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

  // ✅ Handle present users
  for (const user of present) {
    const alreadyParticipant = event.participants.some(
      (p) => p.toString() === user._id
    );

    if (!alreadyParticipant) {
      // Add to participants
      event.participants.push(new mongoose.Types.ObjectId(user._id));

      // Ensure user has a points record for this club
      await ensureClubPoints(user._id);

      // Increment user's points
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { "points.$[elem].points": 10 } },
        { arrayFilters: [{ "elem.clubId": clubId }] }
      );
    }
  }

  // ✅ Handle absent users
  for (const user of absent) {
    const isParticipant = event.participants.some(
      (p) => p.toString() === user._id
    );

    if (isParticipant) {
      // Remove from participants
      event.participants = event.participants.filter(
        (p) => p.toString() !== user._id
      );

      // Ensure user has a points record for this club
      await ensureClubPoints(user._id);

      // Deduct user's points
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { "points.$[elem].points": -10 } },
        { arrayFilters: [{ "elem.clubId": clubId }] }
      );
    }
  }

  await event.save();
  return event;
}
