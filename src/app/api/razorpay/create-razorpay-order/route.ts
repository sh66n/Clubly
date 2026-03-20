// app/api/razorpay/create-razorpay-order/route.ts
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Payment } from "@/models";
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
    .map((question) => {
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
    .filter((item): item is CustomQuestionAnswerInput => Boolean(item));

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
    const { eventId, groupId, customQuestionAnswers = [] } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 },
      );
    }

    if (!Array.isArray(customQuestionAnswers)) {
      return NextResponse.json(
        { error: "customQuestionAnswers must be an array" },
        { status: 400 },
      );
    }

    await connectToDb();

    // Look up the event to get the real registration fee
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (
      (event.customQuestions?.length ?? 0) > 0 &&
      customQuestionAnswers.length === 0
    ) {
      return NextResponse.json(
        { error: "Please answer the registration questions" },
        { status: 400 },
      );
    }

    const answersValidation = validateAndNormalizeAnswers(
      event,
      customQuestionAnswers,
    );
    if (!answersValidation.valid) {
      return NextResponse.json({ error: answersValidation.error }, { status: 400 });
    }

    if (!event.registrationFee || event.registrationFee <= 0) {
      return NextResponse.json(
        { error: "This event is free — no payment required" },
        { status: 400 },
      );
    }

    // Idempotency: check if user already has a paid payment for this event
    const existingPaidPayment = await Payment.findOne({
      userId: session.user.id,
      eventId,
      status: "paid",
    });

    if (existingPaidPayment) {
      return NextResponse.json(
        { error: "Payment already completed for this event" },
        { status: 409 },
      );
    }

    // Use the server-side registration fee (in paise)
    const amountInPaise = Math.round(event.registrationFee * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: {
        eventId,
        userId: session.user.id,
        ...(groupId ? { groupId } : {}),
      },
    });

    // Create a Payment record with status "created"
    await Payment.create({
      razorpayOrderId: order.id,
      userId: session.user.id,
      eventId,
      groupId: groupId || undefined,
      amount: amountInPaise,
      currency: "INR",
      status: "created",
      customQuestionAnswers: answersValidation.answers,
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
