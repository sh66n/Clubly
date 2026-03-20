import { connectToDb } from "@/lib/connectToDb";
import { Club, ClubMember, Event } from "@/models";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    await connectToDb();
    const allClubs = await Club.find({}).lean();

    const clubsWithCounts = await Promise.all(
      allClubs.map(async (club: any) => {
        const [eventsCount, coreTeamCount, volunteerCount] = await Promise.all([
          Event.countDocuments({ organizingClub: club._id }),
          ClubMember.countDocuments({ clubId: club._id, role: "core" }),
          ClubMember.countDocuments({ clubId: club._id, role: "volunteer" }),
        ]);

        return {
          ...club,
          events: new Array(eventsCount).fill(null),
          coreTeamCount,
          volunteerCount,
        };
      }),
    );

    return NextResponse.json(clubsWithCounts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
