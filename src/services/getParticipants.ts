import { Event, Registration } from "@/models";
import { connectToDb } from "@/lib/connectToDb";

/**
 * Get participants of an event (users for individual events, groups for team events)
 * @param eventId MongoDB ObjectId string
 * @returns Array of User objects or Group objects
 */
export async function getParticipants(eventId: string) {
  await connectToDb();

  const event = await Event.findById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  if (event.eventType === "team") {
    // Fetch attended group registrations
    const registrations = await Registration.find({
      eventId,
      groupId: { $exists: true },
      status: "attended",
    }).populate({
      path: "groupId",
      populate: [
        { path: "leader", select: "name email image" },
        { path: "members", select: "name email image" },
      ],
    });

    return registrations
      .filter((r) => r.groupId)
      .map((reg) => {
        const group = reg.groupId as any;
        return {
          _id: group._id.toString(),
          name: group.name,
          isPublic: group.isPublic,
          leader: group.leader?.toObject?.() ?? group.leader,
          members:
            group.members?.map((m: any) => (m.toObject ? m.toObject() : m)) ?? [],
        };
      });
  } else {
    // Fetch attended individual registrations
    const registrations = await Registration.find({
      eventId,
      userId: { $exists: true },
      status: "attended",
    }).populate("userId", "name email image");

    return registrations
      .filter((r) => r.userId)
      .map((reg) => {
        const user = reg.userId as any;
        return {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          image: user.image,
        };
      });
  }
}
