import { Event, Registration, UserPoints } from "@/models";
import mongoose from "mongoose";

export async function assignPointsForEvent(
  eventId: string,
  present: { _id: string; members?: { _id: string }[] }[],
  absent: { _id: string; members?: { _id: string }[] }[],
) {
  const event = await Event.findById(eventId);
  if (!event) throw new Error("Event not found");

  const clubId = event.organizingClub;
  const participationPoints = event.points?.participation ?? 10;

  // Collect all user IDs
  const presentUserIds: string[] = [];
  const absentUserIds: string[] = [];

  for (const item of present) {
    if (event.eventType === "team" && item.members) {
      presentUserIds.push(...item.members.map((m) => m._id));
    } else {
      presentUserIds.push(item._id);
    }
  }

  for (const item of absent) {
    if (event.eventType === "team" && item.members) {
      absentUserIds.push(...item.members.map((m) => m._id));
    } else {
      absentUserIds.push(item._id);
    }
  }

  // Build bulk operations for UserPoints
  const pointsOps: mongoose.AnyBulkWriteOperation<any>[] = [];

  // Add points for present users
  for (const userId of presentUserIds) {
    pointsOps.push({
      updateOne: {
        filter: { userId: new mongoose.Types.ObjectId(userId), clubId },
        update: { $inc: { points: participationPoints } },
        upsert: true,
      },
    });
  }

  // Subtract points for absent users
  for (const userId of absentUserIds) {
    pointsOps.push({
      updateOne: {
        filter: { userId: new mongoose.Types.ObjectId(userId), clubId },
        update: { $inc: { points: -participationPoints } },
        upsert: true,
      },
    });
  }

  // Execute bulk points update
  if (pointsOps.length) {
    await UserPoints.bulkWrite(pointsOps);
  }

  // Build registration status updates
  const registrationOps: mongoose.AnyBulkWriteOperation<any>[] = [];
  const eventObjectId = new mongoose.Types.ObjectId(eventId);

  if (event.eventType === "team") {
    // Update group registration status
    for (const item of present) {
      registrationOps.push({
        updateOne: {
          filter: {
            eventId: eventObjectId,
            groupId: new mongoose.Types.ObjectId(item._id),
          },
          update: { $set: { status: "attended", attendedAt: new Date() } },
        },
      });
    }
    for (const item of absent) {
      registrationOps.push({
        updateOne: {
          filter: {
            eventId: eventObjectId,
            groupId: new mongoose.Types.ObjectId(item._id),
          },
          update: { $set: { status: "absent" } },
        },
      });
    }
  } else {
    // Update individual registration status
    for (const item of present) {
      registrationOps.push({
        updateOne: {
          filter: {
            eventId: eventObjectId,
            userId: new mongoose.Types.ObjectId(item._id),
          },
          update: { $set: { status: "attended", attendedAt: new Date() } },
        },
      });
    }
    for (const item of absent) {
      registrationOps.push({
        updateOne: {
          filter: {
            eventId: eventObjectId,
            userId: new mongoose.Types.ObjectId(item._id),
          },
          update: { $set: { status: "absent" } },
        },
      });
    }
  }

  // Execute bulk registration update
  if (registrationOps.length) {
    await Registration.bulkWrite(registrationOps);
  }

  return event;
}
