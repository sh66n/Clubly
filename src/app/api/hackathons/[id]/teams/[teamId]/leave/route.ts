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
    
    const userId = session.user.id;
    const team = await HackathonTeam.findById(teamId);
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    
    if (!team.members.some((m: any) => m.toString() === userId)) return NextResponse.json({ error: 'Not a member of this team' }, { status: 400 });
    
    const registration = await HackathonRegistration.findOne({ team: teamId });
    if (registration) return NextResponse.json({ error: 'Team already registered, cannot leave' }, { status: 400 });
    
    if (team.leader.toString() === userId) {
      if (team.members.length > 1) {
        const nextLeader = team.members.find((m: any) => m.toString() !== userId);
        team.leader = nextLeader;
        team.members = team.members.filter((m: any) => m.toString() !== userId);
        await team.save();
      } else {
        await HackathonTeam.findByIdAndDelete(teamId);
        return NextResponse.json({ message: 'Team deleted as it became empty' }, { status: 200 });
      }
    } else {
      team.members = team.members.filter((m: any) => m.toString() !== userId);
      await team.save();
    }
    
    return NextResponse.json({ message: 'Left team successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
