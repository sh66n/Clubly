import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { ClubFeature, Badge, Event, Club } from "@/models";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ clubId: string }> },
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { clubId } = await params;
    await connectToDb();

    // 1. Check feature is enabled
    const feature = await ClubFeature.findOne({
      clubId,
      featureSlug: "streak-card",
      enabled: true,
    });

    if (!feature) {
      return NextResponse.json(
        { error: "Feature not available" },
        { status: 404 },
      );
    }

    // 2. Check user follows this club
    const club = await Club.findById(clubId);
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const userId = session.user.id;
    const isFollowing = club.followers?.some(
      (id: any) => id.toString() === userId,
    );

    if (!isFollowing) {
      return NextResponse.json(
        { error: "Must follow club to view streak card" },
        { status: 403 },
      );
    }

    // 3. Get events for this club within semester range
    const { semesterStart, semesterEnd } = feature.config;
    const events = await Event.find({
      organizingClub: new mongoose.Types.ObjectId(clubId),
      date: {
        $gte: new Date(semesterStart),
        $lte: new Date(semesterEnd),
      },
    })
      .sort({ date: 1 })
      .select("_id name date image")
      .lean();

    const eventIds = events.map((e: any) => e._id);

    // 4. Get user's badges for these events
    const badges = await Badge.find({
      userId: new mongoose.Types.ObjectId(userId),
      eventId: { $in: eventIds },
    }).lean();

    const badgeMap = new Map(
      badges.map((b: any) => [b.eventId.toString(), b.type]),
    );

    // 5. Build sticker data
    const stickers = events.map((event: any) => ({
      eventId: event._id.toString(),
      eventName: event.name,
      eventDate: event.date,
      eventImage: event.image,
      badgeType: badgeMap.get(event._id.toString()) || null, // null = not attended
    }));

    return NextResponse.json({
      config: {
        cardFrontImage: feature.config.cardFrontImage,
        cardBackImage: feature.config.cardBackImage,
        gridColumns: feature.config.gridColumns || 3,
        semesterStart: feature.config.semesterStart,
        semesterEnd: feature.config.semesterEnd,
      },
      studentName: session.user.name,
      stickers,
    });
  } catch (error) {
    console.error("Streak card error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
