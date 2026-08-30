import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/connectToDb';
import { Hackathon, HackathonRound, Submission, HackathonTeam, RoundQualification, HackathonRegistration } from '@/models';
import { auth } from '@/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET(req: Request, { params }: { params: Promise<{ id: string; roundId: string }> }) {
  try {
    await connectToDb();
    const { id, roundId } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const isAdmin = session.user.adminClub;
    if (isAdmin) {
      const submissions = await Submission.find({ round: roundId }).populate('team submittedBy');
      return NextResponse.json(submissions, { status: 200 });
    }
    
    const team = await HackathonTeam.findOne({ hackathon: id, members: session.user.id });
    if (!team) return NextResponse.json({ error: 'No team found' }, { status: 404 });
    
    const submission = await Submission.findOne({ round: roundId, team: team._id });
    return NextResponse.json(submission || null, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string; roundId: string }> }) {
  try {
    await connectToDb();
    const { id, roundId } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    
    const hackathon = await Hackathon.findById(id);
    const round = await HackathonRound.findById(roundId);
    if (!hackathon || !round) return NextResponse.json({ error: 'Hackathon or Round not found' }, { status: 404 });
    
    if (round.submissionDeadline && new Date(round.submissionDeadline) < new Date()) {
      return NextResponse.json({ error: 'Round submission deadline has passed' }, { status: 400 });
    }
    
    const team = await HackathonTeam.findOne({ hackathon: id, members: session.user.id });
    if (!team || team.leader.toString() !== session.user.id) return NextResponse.json({ error: 'Only team leader can submit files' }, { status: 403 });
    
    const registration = await HackathonRegistration.findOne({ hackathon: id, team: team._id });
    if (!registration) return NextResponse.json({ error: 'Team is not registered for this hackathon' }, { status: 400 });
    
    if (round.roundNumber > 1) {
      const prevRound = await HackathonRound.findOne({ hackathon: id, roundNumber: round.roundNumber - 1 });
      if (prevRound) {
        const qual = await RoundQualification.findOne({ round: prevRound._id, team: team._id, status: 'qualified' });
        if (!qual) return NextResponse.json({ error: 'Team not qualified for this round' }, { status: 403 });
        if (round.registrationFee && round.registrationFee > 0 && qual.paymentStatus !== 'paid') {
          return NextResponse.json({ error: 'Payment required for this round' }, { status: 402 });
        }
      }
    }
    
    const allowedFormats = hackathon.submissionConfig?.allowedFormats || ['pdf', 'pptx'];
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!ext || !allowedFormats.includes(ext)) return NextResponse.json({ error: `Invalid file format. Allowed: ${allowedFormats.join(', ')}` }, { status: 400 });
    
    const maxSizeMB = hackathon.submissionConfig?.maxFileSizeMB || 20;
    if (file.size > maxSizeMB * 1024 * 1024) return NextResponse.json({ error: `File too large. Max size: ${maxSizeMB}MB` }, { status: 400 });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: `hackathons/${id}/rounds/${roundId}`, resource_type: 'raw' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });
    
    let submission = await Submission.findOne({ round: roundId, team: team._id });
    if (submission) {
      if (submission.filePublicId) {
        try {
          await cloudinary.uploader.destroy(submission.filePublicId, { resource_type: 'raw' });
        } catch (e) {
          console.error('Error destroying old Cloudinary asset:', e);
        }
      }
      submission.fileUrl = uploadResult.secure_url;
      submission.filePublicId = uploadResult.public_id || `raw-${Date.now()}`;
      submission.fileName = file.name;
      submission.fileType = ext;
      submission.fileSizeBytes = file.size;
      submission.version += 1;
      submission.submittedAt = new Date();
      submission.submittedBy = session.user.id;
      await submission.save();
    } else {
      submission = await Submission.create({
        hackathon: id,
        round: roundId,
        team: team._id,
        fileUrl: uploadResult.secure_url,
        filePublicId: uploadResult.public_id || `raw-${Date.now()}`,
        fileName: file.name,
        fileType: ext,
        fileSizeBytes: file.size,
        submittedBy: session.user.id,
      });
    }
    
    return NextResponse.json(submission, { status: 200 });
  } catch (error: any) {
    console.error('Submission upload error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
