import { connectToDb } from "@/lib/connectToDb";
import { ClubFeature, Badge, Event, User } from "@/models";
import { Types } from "mongoose";

export interface StudentStreakSticker {
  eventId: string;
  eventName: string;
  eventDate: string;
  eventImage: string | null;
  numberOfWinners?: number;
  badgeType: "participation" | "winner" | "winner_1" | "winner_2" | "winner_3" | null;
}

export interface StudentProfileStreakCardData {
  clubId: string;
  clubName: string;
  studentName: string;
  config: {
    cardFrontImage: string;
    cardBackImage: string;
    gridColumns: number;
    semesterStart?: string;
    semesterEnd?: string;
  };
  stickers: StudentStreakSticker[];
}

export async function getUserProfileStreakCard(userId: string): Promise<StudentProfileStreakCardData | null> {
  if (!Types.ObjectId.isValid(userId)) return null;

  await connectToDb();
  const userObjectId = new Types.ObjectId(userId);

  // 1. Get user profile
  const user = await User.findById(userObjectId).select("name followingClubs").lean();
  if (!user) return null;

  // 2. Find any active club feature for streak-card
  const feature = await ClubFeature.findOne({
    featureSlug: "streak-card",
    enabled: true,
  })
    .populate("clubId", "name logo department")
    .lean();

  if (!feature || !feature.clubId) return null;

  const club = feature.clubId as any;
  const clubId = club._id;

  // 3. Get events for this club within semester range
  const { semesterStart, semesterEnd } = feature.config;
  const eventFilter: any = {
    organizingClub: clubId,
    status: { $ne: "draft" },
  };

  if (semesterStart && semesterEnd) {
    eventFilter.date = {
      $gte: new Date(semesterStart),
      $lte: new Date(semesterEnd),
    };
  }

  const events = await Event.find(eventFilter)
    .sort({ date: 1 })
    .select("_id name date image numberOfWinners")
    .lean();

  const eventIds = events.map((e: any) => e._id);

  // 4. Get student's badges for these events
  const badges = await Badge.find({
    userId: userObjectId,
    eventId: { $in: eventIds },
  }).lean();

  const badgeMap = new Map<string, any>(
    badges.map((b: any) => [b.eventId.toString(), b.type])
  );

  // 5. Build sticker data for student's card
  const stickers: StudentStreakSticker[] = events.map((event: any) => ({
    eventId: event._id.toString(),
    eventName: event.name,
    eventDate: event.date,
    eventImage: event.image || null,
    numberOfWinners: event.numberOfWinners || 1,
    badgeType: badgeMap.get(event._id.toString()) || null,
  }));

  return {
    clubId: clubId.toString(),
    clubName: club.name || "Club",
    studentName: user.name || "Student",
    config: {
      cardFrontImage: feature.config.cardFrontImage || "/images/streak-card-front.jpg",
      cardBackImage: feature.config.cardBackImage || "/images/streak-card-back.jpg",
      gridColumns: feature.config.gridColumns || 3,
      semesterStart: feature.config.semesterStart,
      semesterEnd: feature.config.semesterEnd,
    },
    stickers,
  };
}
