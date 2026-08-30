import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/connectToDb';
import { Submission } from '@/models';

export async function GET(req: Request, { params }: { params: Promise<{ roundId: string; teamId: string }> }) {
  try {
    await connectToDb();
    const { roundId, teamId } = await params;
    const submission = await Submission.findOne({ round: roundId, team: teamId });
    if (!submission) return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    return NextResponse.json(submission, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
