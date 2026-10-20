import { connectToDb } from "@/lib/connectToDb";
import { Registration, Event, Group } from "@/models";
import mongoose from "mongoose";

export interface StudentActivityItem {
  id: string;
  name: string;
  clubName: string;
  clubLogo?: string;
  date: string;
  rawDate?: string; // YYYY-MM-DD
  type: "contest" | "hackathon" | "workshop" | "event";
  status: "attended" | "registered" | "winner";
  rank?: string;
}

export interface ActivityHeatmapDay {
  date: string; // YYYY-MM-DD
  count: number;
  activities?: StudentActivityItem[];
}

export async function getUserActivityData(userId: string) {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return {
      recentActivities: [],
      heatmapDays: [],
      totalActiveEvents: 0,
      maxStreak: 0,
      technicalEventsCount: 0,
      culturalEventsCount: 0,
      sportsEventsCount: 0,
      totalCollegeEvents: 50,
    };
  }

  await connectToDb();
  const userObjId = new mongoose.Types.ObjectId(userId);

  // 1. Groups user is member of
  const groups = await Group.find({ members: userObjId }, { _id: 1 }).lean();
  const groupIds = groups.map((g) => g._id);

  const regFilter =
    groupIds.length > 0
      ? { $or: [{ userId: userObjId }, { groupId: { $in: groupIds } }] }
      : { userId: userObjId };

  // 2. Fetch all user registrations with populated Event & Organizing Club
  const registrations = await Registration.find(regFilter)
    .populate({
      path: "eventId",
      select: "name slug date organizingClub eventType prize winners winner winnerGroup",
      populate: { path: "organizingClub", select: "name logo department" },
    })
    .sort({ registeredAt: -1, createdAt: -1 })
    .lean();

  const totalCollegeEvents = await Event.countDocuments({ status: { $ne: "draft" } });

  const recentActivities: StudentActivityItem[] = [];
  const eventDates: Date[] = [];

  let technicalEventsCount = 0;
  let culturalEventsCount = 0;
  let sportsEventsCount = 0;

  const seenEventIds = new Set<string>();

  for (const reg of registrations) {
    const ev = reg.eventId as any;
    if (!ev || !ev._id) continue;

    const eventIdStr = ev._id.toString();
    if (seenEventIds.has(eventIdStr)) continue;
    seenEventIds.add(eventIdStr);

    const club = ev.organizingClub as any;
    const clubName = club?.name || "Campus Club";
    const clubDept = (club?.department || "").toLowerCase();

    if (clubDept.includes("computer") || clubDept.includes("tech") || clubDept.includes("it")) {
      technicalEventsCount++;
    } else if (clubDept.includes("sport")) {
      sportsEventsCount++;
    } else {
      culturalEventsCount++;
    }

    const eventDate = ev.date ? new Date(ev.date) : new Date(reg.registeredAt || reg.createdAt);
    eventDates.push(eventDate);

    // Check winner position
    let rank: string | undefined;
    let isWinner = false;
    if (ev.eventType === "individual") {
      const match = (ev.winners || []).find(
        (w: any) => (w.user?._id || w.user)?.toString() === userId,
      );
      if (match) {
        isWinner = true;
        rank = match.position === 1 ? "1st Place Winner" : match.position === 2 ? "Runner-Up" : "3rd Place";
      } else if ((ev.winner?._id || ev.winner)?.toString() === userId) {
        isWinner = true;
        rank = "1st Place Winner";
      }
    } else if (groupIds.length > 0) {
      const match = (ev.winners || []).find((w: any) =>
        groupIds.some((gid) => gid.toString() === (w.group?._id || w.group)?.toString()),
      );
      if (match) {
        isWinner = true;
        rank = match.position === 1 ? "1st Place Winner" : match.position === 2 ? "Runner-Up" : "3rd Place";
      }
    }

    const diffDays = Math.floor((Date.now() - eventDate.getTime()) / (1000 * 60 * 60 * 24));
    let timeAgo = "recently";
    if (diffDays <= 0) timeAgo = "today";
    else if (diffDays === 1) timeAgo = "yesterday";
    else if (diffDays < 30) timeAgo = `${diffDays} days ago`;
    else if (diffDays < 365) timeAgo = `${Math.floor(diffDays / 30)} months ago`;
    else timeAgo = `${Math.floor(diffDays / 365)} years ago`;

    const yearStr = eventDate.getFullYear();
    const monthStr = String(eventDate.getMonth() + 1).padStart(2, "0");
    const dayStr = String(eventDate.getDate()).padStart(2, "0");
    const rawDate = `${yearStr}-${monthStr}-${dayStr}`;

    recentActivities.push({
      id: ev.slug || eventIdStr,
      name: ev.name || "Campus Competition",
      clubName,
      clubLogo: club?.logo,
      date: timeAgo,
      rawDate,
      type: ev.prize && ev.prize > 0 ? "contest" : "event",
      status: isWinner ? "winner" : reg.status === "attended" ? "attended" : "registered",
      rank,
    });
  }

  // 3. Build Heatmap correctly aligned to standard calendar weeks (Sunday to Saturday)
  const today = new Date();
  const dayCountMap = new Map<string, number>();
  const dayActivitiesMap = new Map<string, StudentActivityItem[]>();

  recentActivities.forEach((act) => {
    if (act.rawDate) {
      dayCountMap.set(act.rawDate, (dayCountMap.get(act.rawDate) || 0) + 1);
      const existing = dayActivitiesMap.get(act.rawDate) || [];
      existing.push(act);
      dayActivitiesMap.set(act.rawDate, existing);
    }
  });

  // Align start date to Sunday exactly 52 weeks ago in local calendar time
  const dayOfWeekToday = today.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const startDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  startDate.setDate(startDate.getDate() - (52 * 7) - dayOfWeekToday);

  const heatmapDays: ActivityHeatmapDay[] = [];
  let curr = new Date(startDate);
  const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  endDate.setDate(endDate.getDate() + (6 - dayOfWeekToday)); // Complete current week ending Saturday

  while (curr <= endDate) {
    const year = curr.getFullYear();
    const month = String(curr.getMonth() + 1).padStart(2, "0");
    const day = String(curr.getDate()).padStart(2, "0");
    const key = `${year}-${month}-${day}`;
    heatmapDays.push({
      date: key,
      count: dayCountMap.get(key) || 0,
      activities: dayActivitiesMap.get(key) || [],
    });
    curr.setDate(curr.getDate() + 1);
  }

  // Calculate maximum streak (consecutive active days with events/registrations)
  let maxStreak = 0;
  let currentStreak = 0;
  for (const day of heatmapDays) {
    if (day.count > 0) {
      currentStreak++;
      if (currentStreak > maxStreak) maxStreak = currentStreak;
    } else {
      currentStreak = 0;
    }
  }

  return {
    recentActivities,
    heatmapDays,
    totalActiveEvents: eventDates.length,
    maxStreak: maxStreak > 0 ? maxStreak : (eventDates.length > 0 ? 1 : 0),
    technicalEventsCount,
    culturalEventsCount,
    sportsEventsCount,
    totalCollegeEvents: totalCollegeEvents > 0 ? totalCollegeEvents : 1,
  };
}
