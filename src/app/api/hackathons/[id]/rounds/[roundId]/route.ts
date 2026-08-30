import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { HackathonRound, HackathonTeam, RoundQualification, Submission } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const PATCH = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; roundId: string }> },
) => {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "club-admin" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDb();
    const { id, roundId } = await params;
    
    const round = await HackathonRound.findOne({ _id: roundId, hackathon: id }).populate("hackathon");
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const hackathon = round.hackathon as any;
    const organizingClubId = (hackathon.organizingClub?._id || hackathon.organizingClub)?.toString();
    const adminClubId = session?.user?.adminClub?.toString();
    const isCollab = hackathon.collaboratingClubs?.some(
      (c: any) => (c._id || c)?.toString() === adminClubId
    );

    if (session.user.role !== "admin" && organizingClubId !== adminClubId && !isCollab) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const ALLOWED_FIELDS = [
      "name", "description", "registrationFee", "submissionDeadline", 
      "resultDate", "requiresSubmission", "submissionInstructions", "status"
    ];

    for (const key of ALLOWED_FIELDS) {
      if (body[key] !== undefined) {
        round.set(key, body[key]);
      }
    }

    if (body.status === "completed" && round.isModified("status")) {
      // Auto-eliminate teams that weren't qualified
      const allTeams = await HackathonTeam.find({ hackathon: id, status: { $ne: "eliminated" } });
      const qualifications = await RoundQualification.find({ round: roundId });
      const qualifiedTeamIds = new Set(qualifications.filter(q => q.status === "qualified").map(q => q.team.toString()));
      
      const toEliminate = allTeams.filter(t => !qualifiedTeamIds.has(t._id.toString()));
      
      if (toEliminate.length > 0) {
        await HackathonTeam.updateMany(
          { _id: { $in: toEliminate.map(t => t._id) } },
          { $set: { status: "eliminated" } }
        );
      }
    }

    // Validate status transitions
    if (body.status && !["upcoming", "active", "evaluating", "completed"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    await round.save();

    return NextResponse.json(round, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update round" }, { status: 500 });
  }
};

export const DELETE = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string; roundId: string }> },
) => {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "club-admin" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDb();
    const { id, roundId } = await params;
    
    const round = await HackathonRound.findOne({ _id: roundId, hackathon: id }).populate("hackathon");
    if (!round) {
      return NextResponse.json({ error: "Round not found" }, { status: 404 });
    }

    const hackathon = round.hackathon as any;
    const organizingClubId = (hackathon.organizingClub?._id || hackathon.organizingClub)?.toString();
    if (session.user.role !== "admin" && organizingClubId !== session?.user?.adminClub?.toString()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (round.status !== "upcoming") {
      return NextResponse.json({ error: "Only upcoming rounds can be deleted" }, { status: 400 });
    }

    await Promise.all([
      Submission.deleteMany({ round: roundId }),
      RoundQualification.deleteMany({ round: roundId })
    ]);

    await round.deleteOne();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to delete round" }, { status: 500 });
  }
};
