// /services/getEvent.ts
import { connectToDb } from "@/lib/connectToDb";
import { getEventLookupQuery } from "@/lib/findEvent";
import { Event } from "@/models";

export async function getEvent(idOrSlug: string) {
  await connectToDb();

  const query = getEventLookupQuery(idOrSlug);

  // Fetch the event
  const event = await Event.findOne(query)
    .populate({
      path: "organizingClub",
      select: "_id name",
    })
    .populate({
      path: "winner",
      select: "_id name email image",
    })
    .populate({
      path: "winnerGroup",
      populate: [
        {
          path: "leader",
          select: "_id name email image",
        },
        {
          path: "members",
          select: "_id name email image",
        },
      ],
    })
    .lean();

  if (!event) throw new Error("Event not found");
  return event;
}
