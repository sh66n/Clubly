import { connectToDb } from "@/lib/connectToDb";
import { Event, User } from "@/models";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/events/:id/winners
export const PUT = async (
  req: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    await connectToDb();

    const { winnerIds } = await req.json();
    const { id } = await params;

    if (!winnerIds || !Array.isArray(winnerIds)) {
      return NextResponse.json(
        { error: "winnerIds must be an array of user IDs" },
        { status: 400 }
      );
    }

    // Fetch event
    const event = await Event.findById(id).populate("participants");
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const winnerPoints = event.points?.winner ?? 50; // default to 50
    const clubId = event.organizingClub;

    // Validate winners exist
    const users = await User.find({ _id: { $in: winnerIds } });
    if (users.length !== winnerIds.length) {
      return NextResponse.json(
        { error: "Some winnerIds are invalid" },
        { status: 400 }
      );
    }

    // // Ensure winners are participants
    // const participantIds = event.participants.map((p: any) => p._id.toString());
    // const invalidWinners = winnerIds.filter(
    //   (id: string) => !participantIds.includes(id)
    // );

    // if (invalidWinners.length > 0) {
    //   return NextResponse.json(
    //     {
    //       error: "All winners must be participants of the event",
    //       invalidWinners,
    //     },
    //     { status: 400 }
    //   );
    // }

    // Update winners list
    event.winners = winnerIds;
    await event.save();

    // ✅ Award points per club
    for (const winnerId of winnerIds) {
      const winner = await User.findById(winnerId);

      if (!winner) continue;

      const existing = winner.points.find(
        (p: any) => p.clubId.toString() === clubId.toString()
      );

      if (existing) {
        // ✅ Increment points
        await User.updateOne(
          { _id: winnerId, "points.clubId": clubId },
          { $inc: { "points.$.points": 50 } }
        );
      } else {
        // ✅ Add a new club entry
        await User.updateOne(
          { _id: winnerId },
          { $push: { points: { clubId, points: 50 } } }
        );
      }
    }

    return NextResponse.json(
      {
        message: `Winners assigned and rewarded +${winnerPoints} points each`,
        event,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error assigning winners:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
};
