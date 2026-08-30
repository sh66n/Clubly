import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/connectToDb';
import { HackathonTeam, Hackathon } from '@/models';
import { auth } from '@/auth';
import crypto from 'crypto';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const { id } = await params;
    const session = await auth();
    const isAdmin = session?.user?.adminClub;
    
    const query: any = { hackathon: id };
    if (!isAdmin) {
      query.isPublic = true;
    }
    
    const teams = await HackathonTeam.find(query).populate('members leader', 'name email image department year');
    return NextResponse.json(teams, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { name = 'Untitled Team', isPublic = false } = await req.json();
    const userId = session.user.id;
    
    const existingTeam = await HackathonTeam.findOne({ hackathon: id, members: userId });
    if (existingTeam) return NextResponse.json({ error: 'Already in a team for this hackathon' }, { status: 400 });
    
    const hackathon = await Hackathon.findById(id);
    if (!hackathon) return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    
    const maxSize = hackathon.teamSizeRange?.max || hackathon.teamSize || 5;
    const joinCode = crypto.randomBytes(3).toString('hex').toUpperCase();
    
    const team = await HackathonTeam.create({
      hackathon: id,
      name,
      leader: userId,
      members: [userId],
      isPublic,
      maxSize,
      joinCode,
    });
    
    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
