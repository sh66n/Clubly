import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";

/**
 * Get participants of an event (users for individual events, groups for team events)
 * @param eventId MongoDB ObjectId string
 * @returns Array of User objects or Group objects
 */
export async function getParticipants(eventId: string) {
  await connectToDb();

  const event = await Event.findById(eventId)
    .populate("participants", "name email image") // individual
    .populate({
      path: "participantGroups", // team
      populate: [
        { path: "leader", select: "name email image" },
        { path: "members", select: "name email image" },
      ],
    });

  if (!event) {
    throw new Error("Event not found");
  }

  if (event.eventType === "team") {
    // return groups
    return event.participantGroups.map((group: any) => ({
      _id: group._id.toString(),
      name: group.name,
      isPublic: group.isPublic,
      leader: group.leader?.toObject?.() ?? group.leader,
      members:
        group.members?.map((m: any) => (m.toObject ? m.toObject() : m)) ?? [],
    }));
  } else {
    // return individual users
    return event.participants.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
    }));
  }
}
