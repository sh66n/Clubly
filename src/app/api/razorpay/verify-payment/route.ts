// app/api/razorpay/verify-payment/route.ts

import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { auth } from "@/auth";
import { Event, Payment, Registration } from "@/models";
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

    // Verify Razorpay signature
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

    // Signature valid — process the payment
    await connectToDb();

    // Find the payment record created during order creation
    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, error: "Payment record not found" },
        { status: 404 },
      );
    }

    // Idempotency: if already paid, return success without re-processing
    if (payment.status === "paid") {
      return NextResponse.json({
        success: true,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        alreadyProcessed: true,
      });
    }

    // Fetch payment details from Razorpay (for phone number)
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    const phoneNumber = paymentDetails.contact;

    // Update the Payment record to "paid"
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.status = "paid";
    await payment.save();

    // Update user's phone number if available
    if (phoneNumber) {
      const { User } = await import("@/models");
      await User.findByIdAndUpdate(session.user.id, {
        phoneNumber: phoneNumber,
      });
    }

    // Auto-register the user for the event
    const event = await Event.findById(payment.eventId);
    if (event) {
      if (event.eventType === "individual") {
        await Registration.updateOne(
          { eventId: payment.eventId, userId: session.user.id },
          {
            $setOnInsert: {
              status: "registered",
              registeredAt: new Date(),
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
            },
          },
          { upsert: true },
        );
      }
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
