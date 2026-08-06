import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration, Group, User, Badge, UserPoints } from "@/models";
import mongoose from "mongoose";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { qrData } = body;

    if (!qrData || typeof qrData !== "string") {
      return NextResponse.json({ error: "Invalid QR data" }, { status: 400 });
    }

    // Parse QR: clubly:att:<eventId>:<userId>
    const parts = qrData.split(":");
    if (parts.length !== 4 || parts[0] !== "clubly" || parts[1] !== "att") {
      return NextResponse.json({ error: "Invalid QR format" }, { status: 400 });
    }

    const eventId = parts[2];
    const userId = parts[3];

    await connectToDb();

    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.organizingClub?.toString() !== session.user.adminClub?.toString()) {
      return NextResponse.json({ error: "Not authorized for this event" }, { status: 403 });
    }

    if (event.eventType === "individual") {
      const registration = await Registration.findOne({ eventId, userId });
      
      if (!registration) {
        return NextResponse.json({ error: "No registration found" }, { status: 404 });
      }

      const user = await User.findById(userId);

      if (registration.status === "attended") {
        return NextResponse.json({ 
          alreadyMarked: true, 
          message: "Already marked",
          userName: user?.name,
          userEmail: user?.email
        }, { status: 200 });
      }

      registration.status = "attended";
      registration.attendedAt = new Date();
      await registration.save();
      
      // Award participation badge
      await Badge.findOneAndUpdate(
        { userId, eventId },
        { type: "participation" },
        { upsert: true }
      );

      // Award participation points
      const clubId = event.organizingClub;
      const participationPoints = event.points?.participation ?? 10;
      await UserPoints.findOneAndUpdate(
        { userId: new mongoose.Types.ObjectId(userId), clubId },
        [
          {
            $set: {
              userId: new mongoose.Types.ObjectId(userId),
              clubId,
              points: {
                $max: [
                  0,
                  {
                    $add: [{ $ifNull: ["$points", 0] }, participationPoints],
                  },
                ],
              },
            },
          },
        ],
        { upsert: true }
      );

      return NextResponse.json({ 
        success: true, 
        registration,
        userName: user?.name,
        userEmail: user?.email
      }, { status: 200 });
    } else if (event.eventType === "team") {
      const group = await Group.findOne({ event: eventId, members: userId });
      
      if (!group) {
        return NextResponse.json({ error: "User not in any group for this event" }, { status: 404 });
      }

      const registration = await Registration.findOne({ eventId, groupId: group._id });
      
      if (!registration) {
        return NextResponse.json({ error: "No registration found for this group" }, { status: 404 });
      }

      if (registration.status === "attended") {
        return NextResponse.json({ 
          alreadyMarked: true,
          message: "Already marked",
          groupName: group.name,
          memberCount: group.members.length
        }, { status: 200 });
      }

      registration.status = "attended";
      registration.attendedAt = new Date();
      await registration.save();
      
      // Award participation badges to all group members
      const badgeOps = group.members.map((memberId: any) => ({
        updateOne: {
          filter: { userId: memberId, eventId },
          update: { $set: { type: "participation" } },
          upsert: true
        }
      }));
      if (badgeOps.length > 0) {
        await Badge.bulkWrite(badgeOps);
      }

      // Award participation points to all group members
      const clubId = event.organizingClub;
      const participationPoints = event.points?.participation ?? 10;
      const pointsOps = group.members.map((memberId: any) => ({
        updateOne: {
          filter: { userId: new mongoose.Types.ObjectId(memberId), clubId },
          update: [
            {
              $set: {
                userId: new mongoose.Types.ObjectId(memberId),
                clubId,
                points: {
                  $max: [
                    0,
                    {
                      $add: [{ $ifNull: ["$points", 0] }, participationPoints],
                    },
                  ],
                },
              },
            },
          ],
          upsert: true
        }
      }));
      if (pointsOps.length > 0) {
        await UserPoints.bulkWrite(pointsOps);
      }

      return NextResponse.json({ 
        success: true, 
        registration,
        groupName: group.name,
        memberCount: group.members.length
      }, { status: 200 });
    } else {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error scanning QR:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
