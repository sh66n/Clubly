import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Registration, User, Group } from "@/models";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json({ error: "Missing eventId" }, { status: 400 });
    }

    await connectToDb();

    // Find all attended registrations for the event
    const registrations = await Registration.find({ eventId, status: "attended" })
      .populate("userId", "name email")
      .populate({
        path: "groupId",
        populate: { path: "members", select: "name email" }
      })
      .sort({ attendedAt: -1 });

    const scans = registrations.map((reg) => {
      if (reg.userId) {
        return {
          id: reg._id.toString(),
          timestamp: reg.attendedAt || reg.updatedAt,
          status: "success" as const,
          message: "Attendance marked",
          name: (reg.userId as any).name,
          details: (reg.userId as any).email
        };
      } else if (reg.groupId) {
        const group = reg.groupId as any;
        return {
          id: reg._id.toString(),
          timestamp: reg.attendedAt || reg.updatedAt,
          status: "success" as const,
          message: "Attendance marked",
          name: group.name,
          details: group.members ? `${group.members.length} members` : undefined
        };
      }
      return null;
    }).filter(Boolean);

    return NextResponse.json({ scans }, { status: 200 });
  } catch (error) {
    console.error("Error fetching scans:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
