import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Club } from "@/models";

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

    const club = await Club.findById(session.user.adminClub)
      .populate("bellFollowers", "name email image")
      .lean();

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    const followers = club.bellFollowers || [];

    return NextResponse.json({
      count: followers.length,
      followers,
    }, { status: 200 });
  } catch (error: any) {
    console.error("GET /api/club-admin/bell-followers error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
