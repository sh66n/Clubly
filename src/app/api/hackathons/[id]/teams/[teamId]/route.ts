import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/connectToDb';
import { HackathonTeam } from '@/models';

export async function GET(req: Request, { params }: { params: Promise<{ id: string; teamId: string }> }) {
  try {
    await connectToDb();
    const { teamId } = await params;
    const team = await HackathonTeam.findById(teamId).populate('members leader', 'name email image department year');
    if (!team) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
