import { NextResponse } from 'next/server';
import { connectToDb } from '@/lib/connectToDb';
import { Hackathon, HackathonTeam, HackathonRegistration, User } from '@/models';
import { auth } from '@/auth';
import { getProfileStatus } from '@/lib/utils';

const validateAndNormalizeAnswers = (
  hackathon: any,
  answers: any[],
) => {
  const questions = hackathon.customQuestions ?? [];
  if (questions.length === 0) {
    return { valid: true, answers: [] };
  }

  const answerMap = new Map(
    answers.map((item) => [item.questionId, item.answer]),
  );

  for (const question of questions) {
    const rawAnswer = answerMap.get(question.id);
    const isMissing =
      rawAnswer === undefined ||
      rawAnswer === null ||
      (typeof rawAnswer === "string" && rawAnswer.trim() === "") ||
      (Array.isArray(rawAnswer) && rawAnswer.length === 0);

    if (question.required && isMissing) {
      return {
        valid: false,
        error: `Answer required for: ${question.question}`,
      };
    }
    if (isMissing) continue;

    if (question.type === "text") {
      if (typeof rawAnswer !== "string") {
        return { valid: false, error: `Invalid answer type for: ${question.question}` };
      }
      continue;
    }

    const selectedValues = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
    const normalizedSelectedValues = selectedValues
      .map((value) => String(value).trim())
      .filter(Boolean);

    if (normalizedSelectedValues.some((value) => !(question.options ?? []).includes(value))) {
      return { valid: false, error: `Invalid option selected for: ${question.question}` };
    }

    if (question.type === "select" && normalizedSelectedValues.length > 1) {
      return { valid: false, error: `Only one option allowed for: ${question.question}` };
    }
  }

  const normalizedAnswers = questions.map((question: any) => {
    const rawAnswer = answerMap.get(question.id);
    if (
      rawAnswer === undefined ||
      rawAnswer === null ||
      (typeof rawAnswer === "string" && rawAnswer.trim() === "") ||
      (Array.isArray(rawAnswer) && rawAnswer.length === 0)
    ) return null;

    if (question.type === "multiselect") {
      const selectedValues = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
      return {
        questionId: question.id,
        answer: selectedValues.map((value: any) => String(value).trim()).filter(Boolean),
      };
    }
    if (question.type === "select") {
      const selectedValues = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
      return {
        questionId: question.id,
        answer: String(selectedValues[0]).trim(),
      };
    }
    return {
      questionId: question.id,
      answer: String(rawAnswer).trim(),
    };
  }).filter(Boolean);

  return { valid: true, answers: normalizedAnswers };
};


export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDb();
    const { id } = await params;
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const dbUser = await User.findById(session.user.id);
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    const { isComplete, missingFields } = getProfileStatus(dbUser);
    if (!isComplete) return NextResponse.json({ error: `Please complete your profile. Missing fields: ${missingFields.join(', ')}` }, { status: 400 });
    
    const { teamId, customQuestionAnswers = [] } = await req.json();
    
    const hackathon = await Hackathon.findById(id);
    if (!hackathon) return NextResponse.json({ error: 'Hackathon not found' }, { status: 404 });
    
    const team = await HackathonTeam.findById(teamId).populate('members');
    if (!team || team.hackathon.toString() !== id) return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    if (team.leader.toString() !== session.user.id) return NextResponse.json({ error: 'Only team leader can register' }, { status: 403 });

    const incompleteMember = team.members.find(
      (member: any) => !getProfileStatus(member).isComplete,
    );
    if (incompleteMember) {
      const { missingFields: memberMissing } = getProfileStatus(incompleteMember);
      return NextResponse.json(
        {
          error: `All team members must have a complete profile. ${incompleteMember.name || 'A member'} is missing: ${memberMissing.join(', ')}`,
        },
        { status: 400 },
      );
    }
    
    const memberCount = team.members.length;
    if (hackathon.teamSizeRange?.min && hackathon.teamSizeRange?.max) {
      if (memberCount < hackathon.teamSizeRange.min || memberCount > hackathon.teamSizeRange.max) {
        return NextResponse.json({ error: `Team size must be between ${hackathon.teamSizeRange.min} and ${hackathon.teamSizeRange.max}` }, { status: 400 });
      }
    } else if (hackathon.teamSize && memberCount !== hackathon.teamSize) {
      return NextResponse.json({ error: `Team size must be exactly ${hackathon.teamSize}` }, { status: 400 });
    }
    
    const existingRegistration = await HackathonRegistration.findOne({ hackathon: id, team: teamId });
    if (existingRegistration) return NextResponse.json({ error: 'Team already registered' }, { status: 400 });
    
    const currentRegistrations = await HackathonRegistration.countDocuments({ hackathon: id });
    if (hackathon.maxRegistrations && currentRegistrations >= hackathon.maxRegistrations) {
      return NextResponse.json({ error: 'Registration limit exceeded' }, { status: 400 });
    }

    const answersValidation = validateAndNormalizeAnswers(hackathon, customQuestionAnswers);
    if (!answersValidation.valid) {
      return NextResponse.json({ error: answersValidation.error }, { status: 400 });
    }
    
    const registration = await HackathonRegistration.create({
      hackathon: id,
      team: teamId,
      status: 'registered',
      currentRound: 1,
      customQuestionAnswers: answersValidation.answers,
    });
    
    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
