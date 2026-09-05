import { auth } from "@/auth";
import BackButton from "@/components/BackButton";
import SuperEventDetails from "@/components/SuperEvents/SuperEventDetails";
import React from "react";
import { notFound } from "next/navigation";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration } from "@/models";
import { SuperEvent } from "@/models/superevent.model";

export const dynamic = "force-dynamic";

export default async function SuperEventPage({
  params,
}: {
  params: Promise<{ superEventId: string }>;
}) {
  const { superEventId } = await params;
  const session = await auth();

  await connectToDb();

  const [superEventDoc, eventsDocs] = await Promise.all([
    SuperEvent.findById(superEventId)
      .populate("organizingClub")
      .populate("collaboratingClubs")
      .lean(),
    Event.find({ superEvent: superEventId })
      .sort({ date: 1 })
      .populate("organizingClub")
      .populate("collaboratingClubs")
      .lean(),
  ]);

  if (!superEventDoc) {
    notFound();
  }

  const eventIds = eventsDocs.map((event) => event._id);

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

  const eventsInSuperEvent = eventsDocs.map((event: any) => {
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

  const superEvent = JSON.parse(JSON.stringify(superEventDoc));
  const parsedEvents = JSON.parse(JSON.stringify(eventsInSuperEvent));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <BackButton link={"/events"} />
      <SuperEventDetails
        superEvent={superEvent}
        eventsInSuperEvent={parsedEvents}
        userId={session?.user?.id}
      />
    </div>
  );
}
