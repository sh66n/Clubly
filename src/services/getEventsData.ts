import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration, Club, SuperEvent, Hackathon, HackathonRegistration } from "@/models";
import { Types } from "mongoose";

export async function getEventsData(query?: string, clubId?: string) {
  await connectToDb();
  const filter: Record<string, unknown> = {};

  if (query && query.trim()) {
    filter.name = { $regex: query.trim(), $options: "i" };
  }

  if (clubId && Types.ObjectId.isValid(clubId)) {
    filter.organizingClub = new Types.ObjectId(clubId);
  }

  const events = await Event.find(filter)
    .sort({ date: -1 })
    .populate("organizingClub")
    .populate("collaboratingClubs")
    .lean();

  const eventIds = events.map((event) => event._id);

  const regCounts = await Registration.aggregate([
    { $match: { eventId: { $in: eventIds } } },
    {
      $group: {
        _id: "$eventId",
        individualCount: {
          $sum: {
            $cond: [{ $ifNull: ["$userId", false] }, 1, 0],
          },
        },
        teamCount: {
          $sum: {
            $cond: [{ $ifNull: ["$groupId", false] }, 1, 0],
          },
        },
      },
    },
  ]);

  const regCountMap = new Map(
    regCounts.map((row) => [
      row._id.toString(),
      {
        individualCount: row.individualCount ?? 0,
        teamCount: row.teamCount ?? 0,
      },
    ]),
  );

  const eventsWithCounts = events.map((event: any) => {
    const counts = regCountMap.get(event._id.toString());
    const registrationCount =
      event.eventType === "team"
        ? (counts?.teamCount ?? 0)
        : (counts?.individualCount ?? 0);

    return {
      ...event,
      registrationCount,
    };
  });

  return JSON.parse(JSON.stringify(eventsWithCounts));
}

export async function getSuperEventsData(clubId?: string) {
  await connectToDb();

  const filter: Record<string, unknown> = {};
  if (clubId && Types.ObjectId.isValid(clubId)) {
    filter.$or = [
      { organizingClub: new Types.ObjectId(clubId) },
      { collaboratingClubs: new Types.ObjectId(clubId) },
    ];
  }

  const superEvents = await SuperEvent.find(filter)
    .sort({ startDate: -1 })
    .populate("organizingClub")
    .populate("collaboratingClubs")
    .lean();

  return JSON.parse(JSON.stringify(superEvents));
}

export async function getHackathonsData(query?: string, clubId?: string) {
  await connectToDb();
  const filter: Record<string, unknown> = {};

  if (query && query.trim()) {
    filter.name = { $regex: query.trim(), $options: "i" };
  }

  if (clubId && Types.ObjectId.isValid(clubId)) {
    filter.organizingClub = new Types.ObjectId(clubId);
  }

  const hackathons = await Hackathon.find(filter)
    .sort({ createdAt: -1 })
    .populate("organizingClub")
    .populate("collaboratingClubs")
    .lean();

  const hackathonIds = hackathons.map((h) => h._id);

  const regCounts = await HackathonRegistration.aggregate([
    { $match: { hackathon: { $in: hackathonIds } } },
    {
      $group: {
        _id: "$hackathon",
        count: { $sum: 1 },
      },
    },
  ]);

  const regCountMap = new Map(
    regCounts.map((row) => [row._id.toString(), row.count])
  );

  const hackathonsWithCounts = hackathons.map((h: any) => ({
    ...h,
    registrationCount: regCountMap.get(h._id.toString()) || 0,
  }));

  return JSON.parse(JSON.stringify(hackathonsWithCounts));
}

export async function getAllClubsData() {
  await connectToDb();
  const allClubs = await Club.find({}).lean();
  const clubIds = allClubs.map((club: any) => club._id);

  const [eventCounts, coreCounts, volunteerCounts] = await Promise.all([
    Event.aggregate([
      { $match: { organizingClub: { $in: clubIds } } },
      { $group: { _id: "$organizingClub", count: { $sum: 1 } } },
    ]),
    Registration.aggregate([
      { $match: { eventId: { $in: clubIds } } },
      { $group: { _id: "$eventId", count: { $sum: 1 } } },
    ]).catch(() => []),
    Club.aggregate([
      { $match: { _id: { $in: clubIds } } },
      { $project: { _id: 1 } },
    ]).catch(() => []),
  ]);

  return JSON.parse(JSON.stringify(allClubs));
}
