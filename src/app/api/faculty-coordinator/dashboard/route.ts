import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Club, Event, Registration, UserPoints } from "@/models";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (
      !session ||
      session.user.role !== "faculty-coordinator" ||
      !session.user.adminClub
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clubId = new Types.ObjectId(session.user.adminClub);
    const { searchParams } = new URL(req.url);
    const selectedAcademicYear = searchParams.get("academicYear");

    // 1. Fetch Club Info
    const club = await Club.findById(clubId).select("name fullName department logo followers").lean();
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // 2. Fetch all events for this club to calculate available academic years
    const allClubEvents = await Event.find({ organizingClub: clubId })
      .select("date")
      .lean();

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();
    const currentAcadYear = currentMonth >= 6
      ? `${currentYear}-${currentYear + 1}`
      : `${currentYear - 1}-${currentYear}`;

    const availableYearsSet = new Set<string>();
    availableYearsSet.add(currentAcadYear);

    allClubEvents.forEach((ev: any) => {
      if (ev.date) {
        const d = new Date(ev.date);
        const y = d.getFullYear();
        const m = d.getMonth();
        const ay = m >= 6 ? y : y - 1;
        availableYearsSet.add(`${ay}-${ay + 1}`);
      }
    });

    const availableAcademicYears = Array.from(availableYearsSet).sort().reverse();

    // 3. Query events filtered by academic cycle
    const eventsQuery: any = { organizingClub: clubId };
    if (selectedAcademicYear && selectedAcademicYear.includes("-")) {
      const [startYearStr] = selectedAcademicYear.split("-");
      const startYear = Number(startYearStr);
      if (!isNaN(startYear)) {
        const cycleStart = new Date(startYear, 6, 1, 0, 0, 0, 0);
        const cycleEnd = new Date(startYear + 1, 5, 30, 23, 59, 59, 999);
        eventsQuery.date = { $gte: cycleStart, $lte: cycleEnd };
      }
    }

    const events = await Event.find(eventsQuery)
      .sort({ date: -1 })
      .select("name description date eventType points image status eventPhotos")
      .lean();

    const eventIds = events.map((e: any) => e._id);

    // 4. Calculate stats: registrations, attendees, points
    const registrations = await Registration.find({
      eventId: { $in: eventIds },
    }).select("eventId status userId").lean();

    let totalRegistrations = registrations.length;
    let totalAttended = registrations.filter((r: any) => r.status === "attended").length;

    // Status breakdown
    let liveCount = 0;
    let completedCount = 0;
    let draftCount = 0;

    events.forEach((ev: any) => {
      if (ev.status === "live") liveCount++;
      else if (ev.status === "completed") completedCount++;
      else draftCount++;
    });

    // Total points awarded by this club
    const userPointsRecords = await UserPoints.find({ clubId }).select("points").lean();
    const totalPointsDistributed = userPointsRecords.reduce(
      (sum: number, up: any) => sum + (up.points || 0),
      0
    );

    // Formatted event cards for dashboard table
    const recentEvents = events.map((ev: any) => {
      const eventRegs = registrations.filter(
        (r: any) => r.eventId.toString() === ev._id.toString()
      );
      const attendedCount = eventRegs.filter((r: any) => r.status === "attended").length;

      return {
        id: ev._id.toString(),
        name: ev.name,
        date: ev.date,
        eventType: ev.eventType,
        status: ev.status,
        image: ev.image || "/images/placeholder-event.png",
        registrationsCount: eventRegs.length,
        attendedCount,
        hasPhotos: Boolean(ev.eventPhotos && ev.eventPhotos.length > 0),
        photosCount: ev.eventPhotos?.length || 0,
      };
    });

    return NextResponse.json({
      club: {
        id: club._id,
        name: club.name,
        fullName: club.fullName,
        department: club.department,
        logo: club.logo,
        followersCount: club.followers?.length || 0,
      },
      stats: {
        totalEvents: events.length,
        totalRegistrations,
        totalAttended,
        totalPointsDistributed,
        liveEvents: liveCount,
        completedEvents: completedCount,
      },
      availableAcademicYears,
      recentEvents,
    });
  } catch (error: any) {
    console.error("GET /api/faculty-coordinator/dashboard error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
