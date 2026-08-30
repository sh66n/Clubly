import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Hackathon, HackathonRegistration, HackathonTeam } from "@/models";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

// GET /api/hackathons/[id]/registrations - Fetch all registered teams & members for admin
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectToDb();
    const session = await auth();
    const { id } = await params;

    if (!session || session.user.role !== "club-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    // Verify club admin access
    const adminClubId = session.user.adminClub;
    const isOwner = hackathon.organizingClub.toString() === adminClubId;
    const isCollab = hackathon.collaboratingClubs?.some(
      (c: any) => c.toString() === adminClubId
    );

    if (!isOwner && !isCollab) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const registrations = await HackathonRegistration.find({ hackathon: id })
      .populate({
        path: "team",
        populate: [
          { path: "members", select: "name email image department year phoneNumber rollNumber" },
          { path: "leader", select: "name email image department year phoneNumber rollNumber" },
        ],
      })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(registrations, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch registrations" },
      { status: 500 }
    );
  }
}
