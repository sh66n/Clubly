import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Club, Event, Registration, Payment, Group } from "@/models";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const adminClubId = session.user.adminClub;
    if (!adminClubId) {
      return NextResponse.json({ error: "No club associated with admin" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const selectedAcademicYear = searchParams.get("academicYear");

    await connectToDb();

    const clubObjectId = new Types.ObjectId(adminClubId);

    // 1. Fetch Club Info (to get followers count)
    const club = await Club.findById(clubObjectId).select("followers name").lean();
    const totalFollowers = club?.followers?.length || 0;

    // Fetch all events first to compute available academic years dynamically
    const allClubEvents = await Event.find({ organizingClub: clubObjectId }).select("date").lean();
    
    // Determine available academic years
    const availableYearsSet = new Set<string>();
    allClubEvents.forEach((ev: any) => {
      const d = new Date(ev.date);
      const year = d.getFullYear();
      const month = d.getMonth();
      const acadYear = month >= 6 ? year : year - 1;
      availableYearsSet.add(`${acadYear}-${acadYear + 1}`);
    });
    const availableAcademicYears = Array.from(availableYearsSet).sort().reverse();

    // Construct query with academic cycle bounds if specified
    const query: any = { organizingClub: clubObjectId };
    if (selectedAcademicYear && selectedAcademicYear.includes("-")) {
      const [startYearStr] = selectedAcademicYear.split("-");
      const startYear = Number(startYearStr);
      if (!isNaN(startYear)) {
        const cycleStart = new Date(startYear, 6, 1, 0, 0, 0, 0);
        const cycleEnd = new Date(startYear + 1, 5, 30, 23, 59, 59, 999);
        query.date = { $gte: cycleStart, $lte: cycleEnd };
      }
    }

    // 2. Fetch events organized by this club filtered by cycle
    const clubEvents = await Event.find(query).sort({ date: -1 }).lean();
    const eventIds = clubEvents.map((e: any) => e._id);

    // 3. Count status breakdown for events
    const now = new Date();
    let liveCount = 0;
    let draftCount = 0;
    let completedCount = 0;

    clubEvents.forEach((event: any) => {
      // Fallback status derivation if missing from db document
      let currentStatus = event.status;
      if (!currentStatus) {
        const eventDate = new Date(event.date);
        if (event.isRegistrationOpen === false || eventDate < now) {
          currentStatus = "completed";
        } else {
          currentStatus = "live";
        }
      }

      if (currentStatus === "live") {
        liveCount++;
      } else if (currentStatus === "draft") {
        draftCount++;
      } else if (currentStatus === "completed") {
        completedCount++;
      }
    });

    // 4. Registrations metrics & timeline
    const totalRegistrations = await Registration.countDocuments({
      eventId: { $in: eventIds },
    });

    // Registrations created in the last 24 hours
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const registrationsYesterday = await Registration.countDocuments({
      eventId: { $in: eventIds },
      createdAt: { $gte: yesterday },
    });

    // Registration trend data for the last 7 days
    const dayLabels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const label = d.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
      dayLabels.push(label);
    }

    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const dailyRegistrationsAgg = await Registration.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    const registrationMap: Record<string, number> = {};
    dailyRegistrationsAgg.forEach((item: any) => {
      registrationMap[item._id] = item.count;
    });

    const registrationChartValues: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      registrationChartValues.push(registrationMap[dateStr] || 0);
    }

    // 5. Total Revenue & Revenue trend
    const payments = await Payment.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: "paid",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalRevenueInPaise = payments[0]?.totalAmount || 0;
    const totalRevenue = Math.round(totalRevenueInPaise / 100);

    const revenueYesterdayAgg = await Payment.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: "paid",
          createdAt: { $gte: yesterday },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);
    const revenueYesterday = Math.round((revenueYesterdayAgg[0]?.totalAmount || 0) / 100);

    const dailyRevenueAgg = await Payment.aggregate([
      {
        $match: {
          eventId: { $in: eventIds },
          status: "paid",
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
          },
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const revenueMap: Record<string, number> = {};
    dailyRevenueAgg.forEach((item: any) => {
      revenueMap[item._id] = Math.round(item.totalAmount / 100);
    });

    const revenueChartValues: number[] = [];
    const dayNameLabels: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      revenueChartValues.push(revenueMap[dateStr] || 0);
      dayNameLabels.push(d.toLocaleDateString("en-US", { weekday: "narrow" }));
    }

    // 6. Recent Events Activity with teams & submissions counts
    const eventStatsPromises = clubEvents.map(async (ev: any) => {
      const regCount = await Registration.countDocuments({ eventId: ev._id });
      const groupCount = await Group.countDocuments({ event: ev._id });
      const attendedCount = await Registration.countDocuments({
        eventId: ev._id,
        status: "attended",
      });

      const eventDate = new Date(ev.date);
      let status: "Live" | "Upcoming" | "Completed" = "Completed";
      if (ev.isRegistrationOpen) {
        status = eventDate < now ? "Live" : "Upcoming";
      }

      const formattedDate = eventDate.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return {
        id: ev._id.toString(),
        name: ev.name,
        image: ev.image || "/images/default.png",
        teams: ev.eventType === "team" ? groupCount : regCount,
        submissions: attendedCount,
        status,
        dates: formattedDate,
        mode: ev.eventType === "team" ? "Team" : "Individual",
      };
    });

    const recentEvents = await Promise.all(eventStatsPromises);

    return NextResponse.json({
      stats: {
        totalRegistrations,
        registrationsChange: registrationsYesterday,
        totalRevenue,
        revenueChange: revenueYesterday,
        followers: totalFollowers,
      },
      registrationChart: {
        labels: dayLabels,
        values: registrationChartValues,
      },
      revenueChart: {
        labels: dayNameLabels,
        values: revenueChartValues,
      },
      eventsStatus: {
        live: liveCount,
        draft: draftCount,
        completed: completedCount,
      },
      recentEvents,
      availableAcademicYears,
    });
  } catch (error: any) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
