import { Event } from "@/models/event.model";
import { connectToDb } from "@/lib/connectToDb";

/**
 * Get attendance for an event (individual or team).
 * Returns a list of either users or groups with a `present` flag.
 */
export async function getAttendance(eventId: string) {
  await connectToDb();

  const event = await Event.findById(eventId)
    .populate("registrations", "name email image") // individual
    .populate("participants", "_id") // individual
    .populate({
      path: "groupRegistrations", // team
      populate: [
        { path: "leader", select: "name email image" },
        { path: "members", select: "name email image" },
      ],
    })
    .populate("participantGroups", "_id"); // team

  if (!event) throw new Error("Event not found");

  if (event.eventType === "team") {
    const participantIds = new Set(
      event.participantGroups.map((g: any) => g._id.toString())
    );

    return event.groupRegistrations.map((group: any) => ({
      _id: group._id.toString(),
      name: group.name,
      isPublic: group.isPublic,
      leader: group.leader
        ? {
            _id: group.leader._id.toString(),
            name: group.leader.name,
            email: group.leader.email,
            image: group.leader.image,
          }
        : null,
      members:
        group.members?.map((m: any) => ({
          _id: m._id.toString(),
          name: m.name,
          email: m.email,
          image: m.image,
        })) ?? [],
      present: participantIds.has(group._id.toString()),
    }));
  } else {
    const participantIds = new Set(
      event.participants.map((p: any) => p._id.toString())
    );

    return event.registrations.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.image,
      present: participantIds.has(user._id.toString()),
    }));
  }
}
