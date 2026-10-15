import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Club, User } from "@/models";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

// GET current faculty coordinator for this club
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
      .populate("facultyCoordinator", "name email image department year phoneNumber role")
      .lean();

    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    return NextResponse.json({
      clubName: club.name,
      facultyCoordinator: club.facultyCoordinator || null,
    });
  } catch (error: any) {
    console.error("GET faculty-coordinator error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST assign faculty coordinator by email
export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find candidate user
    const candidate = await User.findOne({ email: normalizedEmail });
    if (!candidate) {
      return NextResponse.json(
        {
          error:
            "User with this email has not signed up on Clubly yet. Ask them to sign in once with Google first.",
        },
        { status: 404 }
      );
    }

    // Check if user is already an admin of a club
    if (candidate.role === "club-admin") {
      return NextResponse.json(
        { error: "This user is already a Club Admin and cannot be assigned as Faculty Coordinator." },
        { status: 400 }
      );
    }

    // Check if user is already a coordinator of ANOTHER club
    if (
      candidate.role === "faculty-coordinator" &&
      candidate.adminClub &&
      candidate.adminClub.toString() !== session.user.adminClub.toString()
    ) {
      return NextResponse.json(
        { error: "This user is already assigned as Faculty Coordinator to another club. Each coordinator can be tied to at most one club." },
        { status: 400 }
      );
    }

    const club = await Club.findById(session.user.adminClub);
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    // If club already had a coordinator, unassign old coordinator
    if (club.facultyCoordinator && club.facultyCoordinator.toString() !== candidate._id.toString()) {
      await User.findByIdAndUpdate(club.facultyCoordinator, {
        $set: { role: "user" },
        $unset: { adminClub: 1 },
      });
    }

    // Assign new coordinator
    candidate.role = "faculty-coordinator";
    candidate.adminClub = new Types.ObjectId(session.user.adminClub);
    await candidate.save();

    club.facultyCoordinator = candidate._id;
    await club.save();

    return NextResponse.json({
      success: true,
      message: `${candidate.name} has been assigned as Faculty Coordinator.`,
      facultyCoordinator: {
        _id: candidate._id,
        name: candidate.name,
        email: candidate.email,
        image: candidate.image,
        department: candidate.department,
        role: candidate.role,
      },
    });
  } catch (error: any) {
    console.error("POST faculty-coordinator error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE unassign faculty coordinator
export async function DELETE(req: NextRequest) {
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

    const club = await Club.findById(session.user.adminClub);
    if (!club) {
      return NextResponse.json({ error: "Club not found" }, { status: 404 });
    }

    if (club.facultyCoordinator) {
      await User.findByIdAndUpdate(club.facultyCoordinator, {
        $set: { role: "user" },
        $unset: { adminClub: 1 },
      });

      club.facultyCoordinator = undefined;
      await club.save();
    }

    return NextResponse.json({
      success: true,
      message: "Faculty coordinator removed successfully.",
    });
  } catch (error: any) {
    console.error("DELETE faculty-coordinator error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
