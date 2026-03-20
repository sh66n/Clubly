import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration } from "@/models";

/**
 * Get users who are registered but not yet marked as participants.
 * @param eventId MongoDB ObjectId string
 * @returns Array of User objects
 */
export async function getPendingRegistrations(eventId: string) {
  await connectToDb();

  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  // Fetch registrations that are still in "registered" status (not attended yet)
  const registrations = await Registration.find({
    eventId,
    userId: { $exists: true },
    status: "registered",
  }).populate("userId", "name email image");

  return registrations
    .filter((r) => r.userId)
    .map((reg) => reg.userId);
}
