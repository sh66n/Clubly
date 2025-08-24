import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models/event.model";
import { User } from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const eventId = await params;
  const { users } = await req.json();
  try {
    await connectToDb();
    const event = await Event.findById(eventId);
    event.winners.push(...users);
    await event.save();
    for (const user of users) {
      const dbUser = await User.findById(user._id);
      const userPoints = dbUser.points.find(
        (pointCard) => pointCard.clubId === event.organizingClub
      );
      userPoints.points += event.points.winner;
      await dbUser.save();
    }
    return NextResponse.json({ message: "success" }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
};
