import { connectToDb } from "@/lib/connectToDb";
import { getEventLookupQuery } from "@/lib/findEvent";
import { Event } from "@/models";

export const getEventType = async (idOrSlug: string) => {
  await connectToDb();
  const query = getEventLookupQuery(idOrSlug);
  const event = await Event.findOne(query).select("eventType");
  if (!event) throw new Error("Event not found");

  return event.eventType;
};
