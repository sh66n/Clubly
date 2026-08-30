import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/connectToDb';
import { RoundQualification, HackathonRegistration, HackathonRound } from '@/models';
import { auth } from '@/auth';

export async function GET(req: Request, { params }: { params: Promise<{ roundId: string }> }) {
  try {
    await connectToDb();
    const { roundId } = await params;
    const qualifications = await RoundQualification.find({ round: roundId });
    return NextResponse.json(qualifications, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; roundId: string }> }) {
  try {
    await connectToDb();
    const { id, roundId } = await params;
    const session = await auth();
    if (!session || !session.user.adminClub) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    
    const { decisions } = await req.json();
    const round = await HackathonRound.findById(roundId);
    if (!round) return NextResponse.json({ error: 'Round not found' }, { status: 404 });
    const nextRound = await HackathonRound.findOne({ hackathon: id, roundNumber: round.roundNumber + 1 });
    
    for (const dec of decisions) {
      let qual = await RoundQualification.findOne({ round: roundId, team: dec.teamId });
      const newPaymentStatus = (dec.status === 'qualified' && nextRound && (nextRound.registrationFee || 0) > 0) ? 'pending' : (qual?.paymentStatus || undefined);
      
      if (qual) {
        qual.status = dec.status;
        qual.remarks = dec.remarks;
        qual.paymentStatus = newPaymentStatus;
        await qual.save();
      } else {
        await RoundQualification.create({
          hackathon: id,
          round: roundId,
          team: dec.teamId,
          status: dec.status,
          remarks: dec.remarks,
          paymentStatus: newPaymentStatus,
        });
      }
      
      const reg = await HackathonRegistration.findOne({ hackathon: id, team: dec.teamId });
      if (reg) {
        if (dec.status === 'eliminated') {
          reg.status = 'eliminated';
        } else if (dec.status === 'qualified' && nextRound) {
          reg.currentRound = nextRound.roundNumber;
        }
        await reg.save();
      }
    }
    
    const updatedQualifications = await RoundQualification.find({ round: roundId });
    return NextResponse.json(updatedQualifications, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
