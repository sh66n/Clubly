import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/connectToDb';
import { HackathonTeam, HackathonRegistration } from '@/models';
import { auth } from '@/auth';

export async function POST(req: Request, { params }: { params: Promise<{ id: string; teamId: string }> }) {
  try {
    await connectToDb();
    const { teamId } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { memberId } = await req.json();
    const userId = session.user.id;
    
    const team = await HackathonTeam.findById(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    
    if (team.leader.toString() !== userId) return NextResponse.json({ error: 'Only team leader can remove members' }, { status: 403 });
    if (memberId === userId) return NextResponse.json({ error: 'Cannot remove self via this route' }, { status: 400 });
    
    const registration = await HackathonRegistration.findOne({ team: teamId });
    if (registration) return NextResponse.json({ error: 'Team already registered, cannot remove members' }, { status: 400 });
    
    team.members = team.members.filter((m: any) => m.toString() !== memberId);
    await team.save();
    
    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
