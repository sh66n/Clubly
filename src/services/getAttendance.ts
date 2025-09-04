import { Event } from "@/models/event.model";
import { connectToDb } from "@/lib/connectToDb";

/**
 * Get all registered users with a `present` flag
 * @param eventId MongoDB ObjectId string
 * @returns Array of { user, present }
 */
export async function getAttendance(eventId: string) {
  await connectToDb();

  const event = await Event.findById(eventId)
    .populate("registrations", "name email image")
    .populate("participants", "_id");

  if (!event) {
    throw new Error("Event not found");
  }

  const participantIds = new Set(
    event.participants.map((p: any) => p._id.toString())
  );

  const result = event.registrations.map((user: any) => ({
    ...user.toObject(),
    present: participantIds.has(user._id.toString()),
  }));

  return result;
}
