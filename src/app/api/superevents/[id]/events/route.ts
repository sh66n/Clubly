import { NextResponse } from "next/server";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration } from "@/models";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  await connectToDb();

  const { id } = await params;

  const events = await Event.find({
    superEvent: id,
  })
    .sort({ date: 1 })
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

  return NextResponse.json(eventsWithCounts);
}
