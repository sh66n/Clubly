import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/connectToDb';
import { HackathonTeam, HackathonRegistration, HackathonRound, RoundQualification, Submission } from '@/models';
import { auth } from '@/auth';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const userId = session.user.id;
    const team = await HackathonTeam.findOne({ hackathon: id, members: userId }).populate('members leader', 'name email image department year');
    
    let registration = null;
    let rounds = await HackathonRound.find({ hackathon: id }).sort('roundNumber');
    let qualifications = [];
    let submissions = [];
    
    if (team) {
      registration = await HackathonRegistration.findOne({ hackathon: id, team: team._id });
      qualifications = await RoundQualification.find({ hackathon: id, team: team._id });
      submissions = await Submission.find({ hackathon: id, team: team._id });
    }
    
    return NextResponse.json({
      myTeam: team,
      myRegistration: registration,
      rounds,
      qualifications,
      submissions
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
