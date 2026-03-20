import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, User, Registration } from "@/models";
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

    // 1. Fetch event
    const event = await Event.findById(id);

    if (!event)
      return NextResponse.json({ error: "Event not found" }, { status: 404 });

    if (
      event.organizingClub.toString() !== session.user.adminClub?.toString()
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 2. Fetch registrations from Registration collection
    let registeredUsers: any[] = [];
    let registeredGroups: any[] = [];

    if (event.eventType === "team") {
      const regs = await Registration.find({
        eventId: id,
        groupId: { $exists: true },
      }).populate({
        path: "groupId",
        populate: {
          path: "members",
          model: User,
        },
      });
      registeredGroups = regs.filter((r) => r.groupId).map((r) => r.groupId);
    } else {
      const regs = await Registration.find({
        eventId: id,
        userId: { $exists: true },
      }).populate({
        path: "userId",
        model: User,
      });
      registeredUsers = regs.filter((r) => r.userId).map((r) => r.userId);
    }

    // 3. Helper function to calculate year
    const getYearFromEmail = (email: string) => {
      if (!email || !email.endsWith("@pvppcoe.ac.in")) return "External";

      const match = email.match(/\d{4}/);
      if (!match) return "N/A";

      const isDSE = email.substring(0, 4).endsWith("s");

      const startYearShort = parseInt(match[0].substring(0, 2));
      const currentYearShort = new Date().getFullYear() % 100;
      const currentMonth = new Date().getMonth();

      const adjustedCurrentYear =
        currentMonth < 6 ? currentYearShort - 1 : currentYearShort;

      let diff = adjustedCurrentYear - startYearShort + 1;

      if (isDSE) diff += 1;

      const yearMap: Record<number, string> = {
        1: "FE (1st Year)",
        2: "SE (2nd Year)",
        3: "TE (3rd Year)",
        4: "BE (4th Year)",
      };

      return yearMap[diff] || "Alumni/Unknown";
    };

    const getDepartmentFromEmail = (email: string) => {
      if (!email || !email.endsWith("@pvppcoe.ac.in")) return "External";

      const prefix = email.substring(0, 3).toLowerCase();

      const deptMap: Record<string, string> = {
        vu1: "Computer Engineering",
        vu2: "Artificial Intelligence & Data Science",
        vu3: "Electronics & Computer Science",
        vu4: "Information Technology",
        vu7: "Mechatronics",
      };

      return deptMap[prefix] || "External";
    };

    // 4. Define CSV Headers (Updated Order)
    const headers = [
      "Team Name",
      "Name",
      "Year",
      "Department",
      "Email",
      "Phone number",
    ];
    let rows: string[] = [];

    // 5. Logic for handling Individual vs Team events
    if (event.eventType === "team") {
      (registeredGroups || []).forEach((group: any) => {
        const teamName = group.name || "Unnamed Team";
        group.members.forEach((member: any) => {
          const studentYear = getYearFromEmail(member.email);
          const department = getDepartmentFromEmail(member.email);
          rows.push(
            [
              `"${teamName}"`,
              `"${member.name}"`,
              `"${studentYear}"`,
              `"${department}"`,
              `"${member.email}"`,
              `"\t${member.phoneNumber ? member.phoneNumber : "---"}"`,
            ].join(","),
          );
        });
      });
    } else {
      // Individual Event
      (registeredUsers || []).forEach((user: any) => {
        const studentYear = getYearFromEmail(user.email);
        const department = getDepartmentFromEmail(user.email);
        rows.push(
          [
            `"N/A"`,
            `"${user.name}"`,
            `"${studentYear}"`,
            `"${department}"`,
            `"${user.email}"`,
            `"\t${user.phoneNumber ? user.phoneNumber : "---"}"`,
          ].join(","),
        );
      });
    }

    const csvContent = [headers.join(","), ...rows].join("\n");

    const encoder = new TextEncoder();
    const csvBytes = encoder.encode(csvContent);

    // Sanitize event name for filename
    const sanitizedEventName = event.name
      .replace(/\s+/g, "-") // Replace spaces with dashes
      .replace(/[\\/:*?"<>|]/g, ""); // Remove strictly illegal filename characters
    const filename = `${sanitizedEventName}.csv`;

    return new Response(csvBytes, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error("CSV Export Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
