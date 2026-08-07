import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event } from "@/models";

export const dynamic = "force-dynamic";

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

    // Fetch all events for this club to compute available academic years
    const allClubEvents = await Event.find({ organizingClub: adminClubId })
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
        const year = d.getFullYear();
        const month = d.getMonth();
        const acadYear = month >= 6 ? year : year - 1;
        availableYearsSet.add(`${acadYear}-${acadYear + 1}`);
      }
    });

    const availableAcademicYears = Array.from(availableYearsSet).sort().reverse();

    return NextResponse.json({
      availableAcademicYears,
      currentAcademicYear: currentAcadYear,
    });
  } catch (error: any) {
    console.error("GET /api/club-admin/academic-years error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
