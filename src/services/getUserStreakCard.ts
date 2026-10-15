import { connectToDb } from "@/lib/connectToDb";
import { ClubFeature, Registration, Event } from "@/models";
import { Types } from "mongoose";

export interface StudentStreakCardData {
  clubId: string;
  clubName: string;
  clubLogo?: string;
  totalEventsInSemester: number;
  attendedEventsCount: number;
  streakCount: number;
  hasStreakCard: boolean;
  slots: {
    eventId: string;
    eventName: string;
    date: string;
    isAttended: boolean;
  }[];
}

export async function getUserStreakCard(userId: string): Promise<StudentStreakCardData | null> {
  if (!Types.ObjectId.isValid(userId)) return null;

  await connectToDb();
  const userObjectId = new Types.ObjectId(userId);

  // 1. Look for enabled streak-card feature across clubs
  const feature = await ClubFeature.findOne({
    featureSlug: "streak-card",
    enabled: true,
  })
    .populate("clubId", "name logo department")
    .lean();

  if (!feature || !feature.clubId) return null;

  const club = feature.clubId as any;
  const clubId = club._id;

  // 2. Fetch events organized by this club in the current semester / window
  const events = await Event.find({
    organizingClub: clubId,
    status: { $ne: "draft" },
  })
    .sort({ date: 1 })
    .lean();

  if (events.length === 0) return null;

  // 3. Check student attended registrations for these events
  const eventIds = events.map((e) => e._id);
  const attendedRegistrations = await Registration.find({
    userId: userObjectId,
    eventId: { $in: eventIds },
    status: "attended",
  })
    .select("eventId")
    .lean();

  const attendedEventSet = new Set(
    attendedRegistrations.map((r) => r.eventId.toString())
  );

  let attendedCount = 0;
  let streak = 0;
  let maxStreak = 0;

  const slots = events.map((ev) => {
    const isAttended = attendedEventSet.has(ev._id.toString());
    if (isAttended) {
      attendedCount++;
      streak++;
      if (streak > maxStreak) maxStreak = streak;
    } else {
      streak = 0;
    }

    return {
      eventId: ev._id.toString(),
      eventName: ev.name,
      date: ev.date
        ? new Date(ev.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "TBD",
      isAttended,
    };
  });

  return {
    clubId: clubId.toString(),
    clubName: club.name || "Club",
    clubLogo: club.logo,
    totalEventsInSemester: events.length,
    attendedEventsCount: attendedCount,
    streakCount: maxStreak,
    hasStreakCard: true,
    slots,
  };
}
