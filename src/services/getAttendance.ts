import { Event, Registration } from "@/models";
import { connectToDb } from "@/lib/connectToDb";

/**
 * Get attendance for an event (individual or team).
 * Returns a list of either users or groups with a `present` flag.
 */
export async function getAttendance(eventId: string) {
  await connectToDb();

  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  if (event.eventType === "team") {
    // Fetch group registrations with populated group data
    const registrations = await Registration.find({
      eventId,
      groupId: { $exists: true },
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
          present: reg.status === "attended",
        };
      });
  } else {
    // Individual event: fetch user registrations
    const registrations = await Registration.find({
      eventId,
      userId: { $exists: true },
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
          present: reg.status === "attended",
        };
      });
  }
}
