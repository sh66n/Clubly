import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Hackathon, HackathonRound } from "@/models";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export const GET = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    await connectToDb();
    const { id } = await params;

    const rounds = await HackathonRound.find({ hackathon: id }).sort({ roundNumber: 1 });

    return NextResponse.json(rounds, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch rounds" }, { status: 500 });
  }
};

export const POST = async (
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) => {
  try {
    const session = await auth();
    if (!session || (session.user.role !== "club-admin" && session.user.role !== "admin")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectToDb();
    const { id } = await params;
    
    const hackathon = await Hackathon.findById(id);
    if (!hackathon) {
      return NextResponse.json({ error: "Hackathon not found" }, { status: 404 });
    }

    const organizingClubId = (hackathon.organizingClub?._id || hackathon.organizingClub)?.toString();
    const adminClubId = session?.user?.adminClub?.toString();
    const isCollab = hackathon.collaboratingClubs?.some(
      (c: any) => (c._id || c)?.toString() === adminClubId
    );

    if (session.user.role !== "admin" && organizingClubId !== adminClubId && !isCollab) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const existingRounds = await HackathonRound.find({ hackathon: id });
    const roundNumber = existingRounds.length > 0 
      ? Math.max(...existingRounds.map(r => r.roundNumber)) + 1 
      : 1;

    const round = await HackathonRound.create({
      hackathon: id,
      roundNumber,
      name: body.name,
      description: body.description,
      registrationFee: body.registrationFee,
      submissionDeadline: body.submissionDeadline,
      resultDate: body.resultDate,
      requiresSubmission: body.requiresSubmission,
      submissionInstructions: body.submissionInstructions,
      status: "upcoming"
    });

    return NextResponse.json(round, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to create round" }, { status: 500 });
  }
};
