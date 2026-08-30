import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { auth } from "@/auth";
import { Event, Payment, Registration, RoundQualification } from "@/models";
import { connectToDb } from "@/lib/connectToDb";

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

    if (
      !body.razorpay_order_id ||
      !body.razorpay_payment_id ||
      !body.razorpay_signature
    ) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 },
      );
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    const generated_signature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Invalid signature" },
        { status: 400 },
      );
    }

    await connectToDb();

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 },
      );
    }

    if (payment.status === "paid") {
      return NextResponse.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        alreadyProcessed: true,
      });
    }

    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    const phoneNumber = paymentDetails.contact;

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "paid";
    await payment.save();

    if (phoneNumber) {
      const { User } = await import("@/models");
      await User.findByIdAndUpdate(session.user.id, {
        phoneNumber: phoneNumber,
      });
    }

    if (payment.eventId) {
      const event = await Event.findById(payment.eventId);
      if (event) {
        if (event.eventType === "individual") {
          await Registration.updateOne(
            { eventId: payment.eventId, userId: payment.userId },
            {
              $setOnInsert: {
                status: "registered",
                registeredAt: new Date(),
                customQuestionAnswers: payment.customQuestionAnswers ?? [],
              },
            },
            { upsert: true },
          );
        } else if (event.eventType === "team" && payment.groupId) {
          await Registration.updateOne(
            { eventId: payment.eventId, groupId: payment.groupId },
            {
              $setOnInsert: {
                status: "registered",
                registeredAt: new Date(),
                customQuestionAnswers: payment.customQuestionAnswers ?? [],
              },
            },
            { upsert: true },
          );
        }
      }
    } else if (payment.hackathonId && payment.roundId && payment.teamId) {
      await RoundQualification.updateOne(
        { round: payment.roundId, team: payment.teamId },
        { $set: { paymentStatus: "paid" } }
      );
    }

    return NextResponse.json({
      success: true,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (error: any) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Payment verification failed",
      },
      { status: 500 },
    );
  }
}
