import { Event, Registration, Group } from "@/models";
import { connectToDb } from "@/lib/connectToDb";
import { Types } from "mongoose";

/**
 * Check if a user is a participant of an event
 * Returns true if:
 * 1. User has an individual registration (status is not 'absent')
 * 2. User belongs to a group registered for this event (status is not 'absent')
 */
export async function isUserEventParticipant(
  eventId: string | Types.ObjectId,
  userId: string | Types.ObjectId
): Promise<boolean> {
  if (!eventId || !userId) return false;
  const eventIdStr = eventId.toString();
  const userIdStr = userId.toString();

  if (!Types.ObjectId.isValid(eventIdStr) || !Types.ObjectId.isValid(userIdStr)) {
    return false;
  }

  await connectToDb();
  const eventObjectId = new Types.ObjectId(eventIdStr);
  const userObjectId = new Types.ObjectId(userIdStr);

  // Run direct check and team group check in parallel
  const [directReg, userGroup] = await Promise.all([
    Registration.exists({
      eventId: eventObjectId,
      userId: userObjectId,
      status: { $ne: "absent" },
    }),
    Group.findOne(
      { event: eventObjectId, members: userObjectId },
      { _id: 1 }
    ).lean(),
  ]);

  if (directReg) return true;

  if (userGroup) {
    const teamReg = await Registration.exists({
      eventId: eventObjectId,
      groupId: (userGroup as any)._id,
      status: { $ne: "absent" },
    });
    if (teamReg) return true;
  }

  return false;
}

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
            group.members?.map((m: any) => (m.toObject ? m.toObject() : m)) ??
            [],
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
