import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, User, Group } from "@/models"; // Ensure Group and User are imported
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

    // 1. Fetch event and populate based on type
    const event = await Event.findById(id)
      .populate({
        path: "participants",
        model: User,
      })
      .populate({
        path: "participantGroups",
        model: "Group",
        populate: {
          path: "members",
          model: User,
        },
      });

    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    if (
      event.organizingClub.toString() !== session.user.adminClub?.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Helper function to calculate year
    const getYearFromEmail = (email: string) => {
      if (!email || !email.endsWith("@pvppcoe.ac.in")) return "External";
      const match = email.match(/\d{4}/);
      if (!match) return "N/A";

      const startYearShort = parseInt(match[0].substring(0, 2));
      const currentYearShort = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth();

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

    // 3. Define CSV Headers (Added Team Name)
    const headers = ["Team Name", "Phone number", "Name", "Email", "Year"];
    let rows: string[] = [];

    // 4. Logic for handling Individual vs Team events
    if (event.eventType === "team") {
      (event.participantGroups || []).forEach((group: any) => {
        const teamName = group.name || "Unnamed Team";
        group.members.forEach((member: any) => {
          const studentYear = getYearFromEmail(member.email);
          rows.push(
            [
              `"${teamName}"`,
              `"${member.phoneNumber ? member.phoneNumber : "---"}"`,
              `"${member.name}"`,
              `"${member.email}"`,
              `"${studentYear}"`,
            ].join(","),
          );
        });
      });
    } else {
      // Individual Event
      (event.participants || []).forEach((user: any) => {
        const studentYear = getYearFromEmail(user.email);
        rows.push(
          [
            `"N/A"`, // No team name for individuals
            `"${user.phoneNumber ? user.phoneNumber : "---"}"`,
            `"${user.name}"`,
            `"${user.email}"`,
            `"${studentYear}"`,
          ].join(","),
        );
      });
    }

    const csvContent = [headers.join(","), ...rows].join("\n");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="attendance_${event.name.replace(/\s+/g, "_")}.csv"`,
      },
    });
  } catch (err: any) {
    console.error("CSV Export Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
