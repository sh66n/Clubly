import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Payment, Hackathon, HackathonRound, User, Group, HackathonTeam } from "@/models";
import { getProfileStatus } from "@/lib/utils";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

type CustomQuestionAnswerInput = {
  questionId: string;
  answer: string | string[];
};

const validateAndNormalizeAnswers = (
  event: any,
  answers: CustomQuestionAnswerInput[],
): { valid: true; answers: CustomQuestionAnswerInput[] } | { valid: false; error: string } => {
  const questions = event.customQuestions ?? [];
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
      return { valid: false, error: `Answer required for: ${question.question}` };
    }

    if (isMissing) {
      continue;
    }

    if (question.type === "text") {
      if (typeof rawAnswer !== "string") {
        return {
          valid: false,
          error: `Invalid answer type for: ${question.question}`,
        };
      }
      continue;
    }

    const selectedValues = Array.isArray(rawAnswer) ? rawAnswer : [rawAnswer];
    const normalizedSelectedValues = selectedValues
      .map((value) => String(value).trim())
      .filter(Boolean);

    if (
      normalizedSelectedValues.some(
        (value) => !(question.options ?? []).includes(value),
      )
    ) {
      return {
        valid: false,
        error: `Invalid option selected for: ${question.question}`,
      };
    }

    if (question.type === "select" && normalizedSelectedValues.length > 1) {
      return {
        valid: false,
        error: `Only one option allowed for: ${question.question}`,
      };
    }
  }

  const normalizedAnswers: CustomQuestionAnswerInput[] = questions
    .map((question: any) => {
      const rawAnswer = answerMap.get(question.id);
      if (
        rawAnswer === undefined ||
        rawAnswer === null ||
        (typeof rawAnswer === "string" && rawAnswer.trim() === "") ||
        (Array.isArray(rawAnswer) && rawAnswer.length === 0)
      ) {
        return null;
      }

      if (question.type === "multiselect") {
        const selectedValues = Array.isArray(rawAnswer)
          ? rawAnswer
          : [rawAnswer];
        return {
          questionId: question.id,
          answer: selectedValues
            .map((value) => String(value).trim())
            .filter(Boolean),
        };
      }

      if (question.type === "select") {
        const selectedValues = Array.isArray(rawAnswer)
          ? rawAnswer
          : [rawAnswer];
        return {
          questionId: question.id,
          answer: String(selectedValues[0]).trim(),
        };
      }

      return {
        questionId: question.id,
        answer: String(rawAnswer).trim(),
      };
    })
    .filter((item: any): item is CustomQuestionAnswerInput => Boolean(item));

  return { valid: true, answers: normalizedAnswers };
};

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { eventId, groupId, customQuestionAnswers = [], hackathonId, roundId, teamId } = body;

    if (!eventId && !hackathonId) {
      return NextResponse.json(
        { error: "eventId or hackathonId is required" },
        { status: 400 },
      );
    }

    await connectToDb();

    const dbUser = await User.findById(session.user.id);
    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { isComplete, missingFields } = getProfileStatus(dbUser);
    if (!isComplete) {
      return NextResponse.json(
        {
          error: `Please complete your profile before proceeding. Missing fields: ${missingFields.join(", ")}`,
        },
        { status: 400 },
      );
    }

    let amountInPaise = 0;
    let notes: any = { userId: session.user.id };

    if (eventId) {
      if (!Array.isArray(customQuestionAnswers)) {
        return NextResponse.json(
          { error: "customQuestionAnswers must be an array" },
          { status: 400 },
        );
      }

      const event = await Event.findById(eventId);
      if (!event) {
        return NextResponse.json({ error: "Event not found" }, { status: 404 });
      }

      if (groupId) {
        const group = await Group.findById(groupId).populate("members");
        if (group && Array.isArray(group.members)) {
          const incompleteMember = group.members.find(
            (member: any) => !getProfileStatus(member).isComplete,
          );
          if (incompleteMember) {
            const { missingFields: memberMissing } =
              getProfileStatus(incompleteMember);
            return NextResponse.json(
              {
                error: `All team members must have a complete profile. ${incompleteMember.name || "A member"} is missing: ${memberMissing.join(", ")}`,
              },
              { status: 400 },
            );
          }
        }
      }

      if ((event.customQuestions?.length ?? 0) > 0 && customQuestionAnswers.length === 0) {
        return NextResponse.json({ error: "Please answer the registration questions" }, { status: 400 });
      }

      const answersValidation = validateAndNormalizeAnswers(event, customQuestionAnswers);
      if (!answersValidation.valid) {
        return NextResponse.json({ error: answersValidation.error }, { status: 400 });
      }

      if (!event.registrationFee || event.registrationFee <= 0) {
        return NextResponse.json({ error: "This event is free — no payment required" }, { status: 400 });
      }

      const existingPaidPayment = await Payment.findOne({
        userId: session.user.id,
        eventId,
        status: "paid",
      });

      if (existingPaidPayment) {
        return NextResponse.json({ error: "Payment already completed for this event" }, { status: 409 });
      }

      amountInPaise = Math.round(event.registrationFee * 100);
      notes.eventId = eventId;
      if (groupId) notes.groupId = groupId;

    } else if (hackathonId && roundId) {
      const round = await HackathonRound.findById(roundId);
      if (!round || round.hackathon.toString() !== hackathonId) {
        return NextResponse.json({ error: "Round not found" }, { status: 404 });
      }

      if (teamId) {
        const team = await HackathonTeam.findById(teamId).populate("members");
        if (team && Array.isArray(team.members)) {
          const incompleteMember = team.members.find(
            (member: any) => !getProfileStatus(member).isComplete,
          );
          if (incompleteMember) {
            const { missingFields: memberMissing } =
              getProfileStatus(incompleteMember);
            return NextResponse.json(
              {
                error: `All team members must have a complete profile. ${incompleteMember.name || "A member"} is missing: ${memberMissing.join(", ")}`,
              },
              { status: 400 },
            );
          }
        }
      }

      if (!round.registrationFee || round.registrationFee <= 0) {
        return NextResponse.json({ error: "This round is free — no payment required" }, { status: 400 });
      }
      
      const existingPaidPayment = await Payment.findOne({
        userId: session.user.id,
        hackathonId,
        roundId,
        status: "paid",
      });

      if (existingPaidPayment) {
        return NextResponse.json({ error: "Payment already completed for this round" }, { status: 409 });
      }

      amountInPaise = Math.round(round.registrationFee * 100);
      notes.hackathonId = hackathonId;
      notes.roundId = roundId;
      if (teamId) notes.teamId = teamId;
    }

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes,
    });

    await Payment.create({
      razorpayOrderId: order.id,
      userId: session.user.id,
      eventId: eventId || undefined,
      groupId: groupId || undefined,
      hackathonId: hackathonId || undefined,
      roundId: roundId || undefined,
      teamId: teamId || undefined,
      amount: amountInPaise,
      currency: "INR",
      status: "created",
      customQuestionAnswers: eventId ? customQuestionAnswers : undefined,
    });

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay error:", error);
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error.error?.description || error.message,
      },
      { status: 500 },
    );
  }
}
