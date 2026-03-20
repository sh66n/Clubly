import { connectToDb } from "@/lib/connectToDb";
import { Club, ClubMember, Event } from "@/models";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToDb();
    const allClubs = await Club.find({}).lean();
    const clubIds = allClubs.map((club: any) => club._id);

    const [eventCounts, coreCounts, volunteerCounts] = await Promise.all([
      Event.aggregate([
        { $match: { organizingClub: { $in: clubIds } } },
        { $group: { _id: "$organizingClub", count: { $sum: 1 } } },
      ]),
      ClubMember.aggregate([
        { $match: { clubId: { $in: clubIds }, role: "core" } },
        { $group: { _id: "$clubId", count: { $sum: 1 } } },
      ]),
      ClubMember.aggregate([
        { $match: { clubId: { $in: clubIds }, role: "volunteer" } },
        { $group: { _id: "$clubId", count: { $sum: 1 } } },
      ]),
    ]);

    const eventCountMap = new Map(
      eventCounts.map((row) => [row._id.toString(), row.count ?? 0]),
    );
    const coreCountMap = new Map(
      coreCounts.map((row) => [row._id.toString(), row.count ?? 0]),
    );
    const volunteerCountMap = new Map(
      volunteerCounts.map((row) => [row._id.toString(), row.count ?? 0]),
    );

    const clubsWithCounts = allClubs.map((club: any) => {
      const id = club._id.toString();
      const eventsCount = eventCountMap.get(id) ?? 0;
      const coreTeamCount = coreCountMap.get(id) ?? 0;
      const volunteerCount = volunteerCountMap.get(id) ?? 0;

      return {
        ...club,
        events: new Array(eventsCount).fill(null),
        coreTeamCount,
        volunteerCount,
      };
    });

    return NextResponse.json(clubsWithCounts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
