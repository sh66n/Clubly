import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";

/**
 * Get users who are marked as participants of an event.
 * @param eventId MongoDB ObjectId string
 * @returns Array of User objects
 */
export async function getParticipants(eventId: string) {
  await connectToDb();

  const event = await Event.findById(eventId).populate(
    "participants",
    "name email image"
  ); // populate participant details

  if (!event) {
    throw new Error("Event not found");
  }

  return event.participants;
}
