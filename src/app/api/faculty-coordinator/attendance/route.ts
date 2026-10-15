import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Registration, User, Group } from "@/models";
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
    const eventId = searchParams.get("eventId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const academicYear = searchParams.get("academicYear");

    // 1. Fetch ALL club events in this academic year for the dropdown options
    const dropdownQuery: any = { organizingClub: clubId };
    if (academicYear && academicYear.includes("-")) {
      const [startYearStr] = academicYear.split("-");
      const startYear = Number(startYearStr);
      if (!isNaN(startYear)) {
        const cycleStart = new Date(startYear, 6, 1, 0, 0, 0, 0);
        const cycleEnd = new Date(startYear + 1, 5, 30, 23, 59, 59, 999);
        dropdownQuery.date = { $gte: cycleStart, $lte: cycleEnd };
      }
    }

    const allDropdownEvents = await Event.find(dropdownQuery)
      .sort({ date: -1 })
      .select("_id name date eventType")
      .lean();

    // 2. Build attendance events query (filtered by selected eventId and/or date range)
    const attendanceEventQuery: any = { organizingClub: clubId };
    if (eventId) {
      attendanceEventQuery._id = new Types.ObjectId(eventId);
    } else if (dropdownQuery.date) {
      attendanceEventQuery.date = dropdownQuery.date;
    }

    if (startDate || endDate) {
      attendanceEventQuery.date = attendanceEventQuery.date || {};
      if (startDate) attendanceEventQuery.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        attendanceEventQuery.date.$lte = end;
      }
    }

    const filteredEvents = await Event.find(attendanceEventQuery)
      .select("_id name date eventType")
      .lean();

    const eventIds = filteredEvents.map((e: any) => e._id);
    const eventMap = new Map(
      allDropdownEvents.map((e: any) => [e._id.toString(), { name: e.name, date: e.date, type: e.eventType }])
    );
    filteredEvents.forEach((e: any) => {
      eventMap.set(e._id.toString(), { name: e.name, date: e.date, type: e.eventType });
    });

    if (eventIds.length === 0) {
      return NextResponse.json({
        events: allDropdownEvents.map((e: any) => ({ id: e._id, name: e.name, date: e.date })),
        totalRecords: 0,
        attendanceRecords: [],
      });
    }

    // Fetch registrations
    const registrations = await Registration.find({
      eventId: { $in: eventIds },
    })
      .populate("userId", "name email department year phoneNumber")
      .populate({
        path: "groupId",
        populate: {
          path: "members",
          select: "name email department year phoneNumber",
        },
      })
      .sort({ registeredAt: -1 })
      .lean();

    // Flatten into consistent attendance rows
    const attendanceRecords: any[] = [];

    registrations.forEach((reg: any) => {
      const evInfo = eventMap.get(reg.eventId.toString());
      if (reg.groupId) {
        const teamName = reg.groupId.name;
        (reg.groupId.members || []).forEach((member: any) => {
          attendanceRecords.push({
            id: `${reg._id}-${member._id}`,
            registrationId: reg._id,
            eventId: reg.eventId,
            eventName: evInfo?.name || "Event",
            eventDate: evInfo?.date,
            eventType: "team",
            teamName,
            studentName: member.name || "N/A",
            studentEmail: member.email || "N/A",
            department: member.department || "N/A",
            year: member.year || "N/A",
            phoneNumber: member.phoneNumber || "N/A",
            status: reg.status,
            registeredAt: reg.registeredAt || reg.createdAt,
            attendedAt: reg.attendedAt,
          });
        });
      } else if (reg.userId) {
        attendanceRecords.push({
          id: `${reg._id}-${reg.userId._id}`,
          registrationId: reg._id,
          eventId: reg.eventId,
          eventName: evInfo?.name || "Event",
          eventDate: evInfo?.date,
          eventType: "individual",
          studentName: reg.userId.name || "N/A",
          studentEmail: reg.userId.email || "N/A",
          department: reg.userId.department || "N/A",
          year: reg.userId.year || "N/A",
          phoneNumber: reg.userId.phoneNumber || "N/A",
          status: reg.status,
          registeredAt: reg.registeredAt || reg.createdAt,
          attendedAt: reg.attendedAt,
        });
      }
    });

    return NextResponse.json({
      events: allDropdownEvents.map((e: any) => ({ id: e._id, name: e.name, date: e.date })),
      totalRecords: attendanceRecords.length,
      attendanceRecords,
    });
  } catch (error: any) {
    console.error("GET /api/faculty-coordinator/attendance error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
