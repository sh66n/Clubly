import { connectToDb } from "@/lib/connectToDb";
import { Badge, Registration, Event, Group } from "@/models";
import { Types } from "mongoose";

export interface StudentBadgeItem {
  id: string;
  eventId: string;
  title: string;
  description: string;
  rarity: "common" | "rare" | "epic" | "legendary";
  unlocked: boolean;
  unlockedAt?: string;
  clubName: string;
  clubLogo?: string;
  eventName: string;
  badgeType: "participation" | "winner_1" | "winner_2" | "winner_3";
  isWinner: boolean;
  date?: string;
}

export async function getUserBadges(userId: string): Promise<StudentBadgeItem[]> {
  if (!Types.ObjectId.isValid(userId)) return [];

  await connectToDb();
  const userObjectId = new Types.ObjectId(userId);

  // 1. Fetch user groups
  const groups = await Group.find({ members: userObjectId }, { _id: 1 }).lean();
  const groupIds = groups.map((g) => g._id);

  // 2. Fetch all official Badge documents for the user
  const dbBadges = await Badge.find({ userId: userObjectId }).lean();
  const badgeMap = new Map<string, any>();
  for (const b of dbBadges) {
    badgeMap.set(b.eventId.toString(), b);
  }

  // 3. Fetch all attended registrations for the user
  const regFilter =
    groupIds.length > 0
      ? {
          $or: [{ userId: userObjectId }, { groupId: { $in: groupIds } }],
          status: "attended",
        }
      : { userId: userObjectId, status: "attended" };

  const attendedRegs = await Registration.find(regFilter).select("eventId attendedAt registeredAt").lean();
  const attendedEventMap = new Map<string, Date>();
  for (const reg of attendedRegs) {
    if (reg.eventId) {
      attendedEventMap.set(reg.eventId.toString(), reg.attendedAt || reg.registeredAt || new Date());
    }
  }

  // 4. Fetch all campus events with their organizing clubs
  const allEvents = await Event.find({ status: { $ne: "draft" } })
    .populate("organizingClub", "name logo department")
    .sort({ date: -1 })
    .lean();

  const badgesList: StudentBadgeItem[] = [];

  for (const ev of allEvents) {
    const eventIdStr = ev._id.toString();
    const club = ev.organizingClub as any;
    const clubName = club?.name || "Campus Club";
    const clubLogo = club?.logo;

    const hasBadgeDoc = badgeMap.get(eventIdStr);
    const hasAttended = attendedEventMap.has(eventIdStr);
    const isUnlocked = Boolean(hasBadgeDoc || hasAttended);

    // Determine badge rank / type
    let badgeType: "participation" | "winner_1" | "winner_2" | "winner_3" = "participation";
    let rarity: "common" | "rare" | "epic" | "legendary" = "common";
    let isWinner = false;

    if (hasBadgeDoc) {
      if (hasBadgeDoc.type === "winner_1" || hasBadgeDoc.type === "winner") {
        badgeType = "winner_1";
        rarity = "legendary";
        isWinner = true;
      } else if (hasBadgeDoc.type === "winner_2") {
        badgeType = "winner_2";
        rarity = "epic";
        isWinner = true;
      } else if (hasBadgeDoc.type === "winner_3") {
        badgeType = "winner_3";
        rarity = "rare";
        isWinner = true;
      }
    } else {
      // Check event winners array if user or group won
      const userStr = userId.toString();
      const match = (ev.winners || []).find((w: any) => {
        const uId = (w.user?._id || w.user)?.toString();
        const gId = (w.group?._id || w.group)?.toString();
        return uId === userStr || (gId && groupIds.some((gid) => gid.toString() === gId));
      });

      if (match) {
        isWinner = true;
        if (match.position === 1) {
          badgeType = "winner_1";
          rarity = "legendary";
        } else if (match.position === 2) {
          badgeType = "winner_2";
          rarity = "epic";
        } else if (match.position === 3) {
          badgeType = "winner_3";
          rarity = "rare";
        }
      }
    }

    const title = isWinner
      ? badgeType === "winner_1"
        ? `Champion: ${ev.name}`
        : badgeType === "winner_2"
        ? `Runner-Up: ${ev.name}`
        : `3rd Place: ${ev.name}`
      : `${ev.name} Badge`;

    const description = isWinner
      ? `Victory badge earned for podium finish at ${ev.name} hosted by ${clubName}.`
      : `Official participation coin badge earned by attending ${ev.name} organized by ${clubName}.`;

    const unlockedDate = hasBadgeDoc?.createdAt || attendedEventMap.get(eventIdStr);
    const dateStr = unlockedDate
      ? new Date(unlockedDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : ev.date
      ? new Date(ev.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : undefined;

    badgesList.push({
      id: `event-badge-${eventIdStr}`,
      eventId: eventIdStr,
      title,
      description,
      rarity,
      unlocked: isUnlocked,
      unlockedAt: isUnlocked ? dateStr : undefined,
      clubName,
      clubLogo,
      eventName: ev.name,
      badgeType,
      isWinner,
      date: dateStr,
    });
  }

  // Sort unlocked badges to top, then by date
  return badgesList.sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return 0;
  });
}
