import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration, Payment, Feedback } from "@/models";

export const dynamic = "force-dynamic";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: Date;
  type: "registration" | "payment" | "feedback";
}

export async function GET(req: NextRequest) {
  try {
    await connectToDb();
    const session = await auth();

    if (
      !session ||
      session.user.role !== "club-admin" ||
      !session.user.adminClub
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClubId = session.user.adminClub;
    const { searchParams } = new URL(req.url);
    const selectedAcademicYear = searchParams.get("academicYear");

    // Construct query with academic cycle bounds if specified
    const query: any = { organizingClub: adminClubId };
    if (selectedAcademicYear && selectedAcademicYear.includes("-")) {
      const [startYearStr] = selectedAcademicYear.split("-");
      const startYear = Number(startYearStr);
      if (!isNaN(startYear)) {
        const cycleStart = new Date(startYear, 6, 1, 0, 0, 0, 0);
        const cycleEnd = new Date(startYear + 1, 5, 30, 23, 59, 59, 999);
        query.date = { $gte: cycleStart, $lte: cycleEnd };
      }
    }

    // 1. Fetch events organized by this club to filter queries
    const clubEvents = await Event.find(query).select("_id name").lean();
    const eventIds = clubEvents.map((e: any) => e._id);
    const eventMap = new Map(clubEvents.map((e: any) => [e._id.toString(), e.name]));

    if (eventIds.length === 0) {
      return NextResponse.json({ count: 0, notifications: [] }, { status: 200 });
    }

    // 2. Fetch recent registrations (limit 15)
    const registrations = await Registration.find({ eventId: { $in: eventIds } })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("userId", "name")
      .lean();

    // 3. Fetch recent payments (limit 15)
    const payments = await Payment.find({ eventId: { $in: eventIds }, status: "paid" })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("userId", "name")
      .lean();

    // 4. Fetch recent feedback (limit 15)
    const feedbacks = await Feedback.find({ eventId: { $in: eventIds } })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("userId", "name")
      .lean();

    // 5. Transform and merge chronological log
    const notificationList: NotificationItem[] = [];

    registrations.forEach((reg: any) => {
      if (!reg.userId) return;
      const eventName = eventMap.get(reg.eventId.toString()) || "Event";
      notificationList.push({
        id: `reg-${reg._id}`,
        title: "New Registration",
        message: `${reg.userId.name} registered for ${eventName}`,
        time: reg.createdAt || reg.registeredAt,
        type: "registration",
      });
    });

    payments.forEach((pay: any) => {
      if (!pay.userId) return;
      const eventName = eventMap.get(pay.eventId.toString()) || "Event";
      const amountInRupees = Math.round(pay.amount / 100);
      notificationList.push({
        id: `pay-${pay.razorpayOrderId}`,
        title: "Payment Received",
        message: `₹${amountInRupees} received from ${pay.userId.name} for ${eventName}`,
        time: pay.createdAt || new Date(),
        type: "payment",
      });
    });

    feedbacks.forEach((fb: any) => {
      if (!fb.userId) return;
      const eventName = eventMap.get(fb.eventId.toString()) || "Event";

      let ratingVal = fb.rating;
      if (typeof ratingVal !== "number" && Array.isArray(fb.answers) && fb.answers.length > 0) {
        const validAnswers = fb.answers.filter((a: any) => typeof a?.rating === "number" && a.rating > 0);
        if (validAnswers.length > 0) {
          const sum = validAnswers.reduce((acc: number, a: any) => acc + a.rating, 0);
          ratingVal = Math.round((sum / validAnswers.length) * 10) / 10;
        }
      }

      const messageText = typeof ratingVal === "number" 
        ? `${fb.userId.name} rated ${eventName} with ${ratingVal}★`
        : `${fb.userId.name} submitted feedback for ${eventName}`;

      notificationList.push({
        id: `fb-${fb._id}`,
        title: "New Review",
        message: messageText,
        time: fb.createdAt,
        type: "feedback",
      });
    });

    // Sort notifications chronologically (newest first)
    notificationList.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    // Take top 20
    const recentNotifications = notificationList.slice(0, 20);

    return NextResponse.json({
      count: recentNotifications.length,
      notifications: recentNotifications,
    }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/club-admin/notifications error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
