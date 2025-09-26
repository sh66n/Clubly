import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";

export const getEventType = async (eventId: string) => {
  await connectToDb();
  const event = await Event.findById(eventId).select("eventType");
  if (!event) throw new Error("Event not found");

  return event.eventType;
};
