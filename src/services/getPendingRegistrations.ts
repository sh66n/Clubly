import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";

/**
 * Get users who are registered but not yet marked as participants.
 * @param eventId MongoDB ObjectId string
 * @returns Array of User objects
 */
export async function getPendingRegistrations(eventId: string) {
  await connectToDb();

  const event = await Event.findById(eventId)
    .populate("registrations", "name email image") // only fetch needed fields
    .populate("participants", "_id"); // only need IDs here

  if (!event) {
    throw new Error("Event not found");
  }

  const participantIds = new Set(
    event.participants.map((p: any) => p._id.toString())
  );

  const pending = event.registrations.filter(
    (r: any) => !participantIds.has(r._id.toString())
  );

  return pending;
}
