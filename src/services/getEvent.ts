// /services/getEvent.ts
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";

export async function getEvent(eventId: string) {
  await connectToDb();

  // Fetch the event
  const event = await Event.findById(eventId)
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
