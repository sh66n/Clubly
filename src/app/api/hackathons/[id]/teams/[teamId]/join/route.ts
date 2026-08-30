import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/connectToDb';
import { HackathonTeam, HackathonRegistration } from '@/models';
import { auth } from '@/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string; teamId: string }> }) {
  try {
    await connectToDb();
    const { id, teamId } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    let body = {};
    try {
      body = await req.json();
    } catch(e){}
    const { joinCode } = body as { joinCode?: string };
    const userId = session.user.id;
    
    const existingTeam = await HackathonTeam.findOne({ hackathon: id, members: userId });
    if (existingTeam) return NextResponse.json({ error: 'Already in a team for this hackathon' }, { status: 400 });
    
    let team = null;
    if (teamId !== "by-code") {
      team = await HackathonTeam.findById(teamId);
    }
    if (!team && joinCode) {
      team = await HackathonTeam.findOne({ hackathon: id, joinCode: joinCode.trim().toUpperCase() });
    }

    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    
    const teamLimit = team.maxSize || 5;
    if (team.members.length >= teamLimit) {
      return NextResponse.json({ error: 'Team is full' }, { status: 400 });
    }
    if (!team.isPublic && team.joinCode && team.joinCode.toUpperCase() !== (joinCode || "").toUpperCase()) {
      return NextResponse.json({ error: 'Invalid join code' }, { status: 400 });
    }
    
    const registration = await HackathonRegistration.findOne({ team: team._id });
    if (registration) return NextResponse.json({ error: 'Team is already registered for the hackathon' }, { status: 400 });
    
    team.members.push(userId);
    await team.save();

    await team.populate('members leader', 'name email image department year');
    
    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
