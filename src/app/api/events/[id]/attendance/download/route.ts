import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, User } from "@/models"; // Ensure User is imported for populate
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    const session = await auth();
    if (!session || session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDb();

    // 1. Populate participants - ensure User model is registered
    const event = await Event.findById(id).populate({
      path: "participants",
      model: User,
    });

    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    if (
      event.organizingClub.toString() !== session.user.adminClub?.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Helper function to calculate year from email
    const getYearFromEmail = (email: string) => {
      if (!email.endsWith("@pvppcoe.ac.in")) return "External";

      // Extract the digits (e.g., '2324' from 'vu1f2324058...')
      const match = email.match(/\d{4}/);
      if (!match) return "N/A";

      const startYearShort = parseInt(match[0].substring(0, 2)); // e.g., 23
      const currentYearShort = new Date().getFullYear() % 100; // e.g., 26
      const currentMonth = new Date().getMonth(); // 0-indexed (0 is Jan)

      // Academic year shift: if we are in Jan-May, we are still in the cycle of the previous year
      const adjustedCurrentYear =
        currentMonth < 6 ? currentYearShort - 1 : currentYearShort;

      const diff = adjustedCurrentYear - startYearShort + 1;

      const yearMap: Record<number, string> = {
        1: "FE (1st Year)",
        2: "SE (2nd Year)",
        3: "TE (3rd Year)",
        4: "BE (4th Year)",
      };

      return yearMap[diff] || "Alumni/Unknown";
    };

    // 3. Define CSV Headers
    const headers = ["Name", "Email", "Year"];

    // 4. Map participants to CSV rows
    const rows = (event.participants || []).map((user: any) => {
      const studentYear = getYearFromEmail(user.email);

      return [`"${user.name}"`, `"${user.email}"`, `"${studentYear}"`].join(
        ",",
      );
    });

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance_${event.name.replace(/\s+/g, "_")}.csv"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
