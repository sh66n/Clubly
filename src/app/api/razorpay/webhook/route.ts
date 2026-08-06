// app/api/razorpay/webhook/route.ts

import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Payment, Registration } from "@/models";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify the signature. Razorpay recommends using webhook secret if configured,
    // fallback to key secret if not separately configured.
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET!;
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(bodyText)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const eventData = JSON.parse(bodyText);
    const eventName = eventData.event;

    // We only process order paid or payment captured events to mark registration as paid
    if (eventName === "order.paid" || eventName === "payment.captured") {
      await connectToDb();

      let orderId = "";
      let paymentId = "";
      let contactPhone = "";

      if (eventName === "order.paid") {
        orderId = eventData.payload.order.entity.id;
        // Grab the payment details from payment list in order payload if available
        const payments = eventData.payload.payment?.entity;
        if (payments) {
          paymentId = payments.id;
          contactPhone = payments.contact || "";
        }
      } else {
        paymentId = eventData.payload.payment.entity.id;
        orderId = eventData.payload.payment.entity.order_id;
        contactPhone = eventData.payload.payment.entity.contact || "";
      }

      if (!orderId) {
        return NextResponse.json({ success: true, message: "No order ID found in payload" });
      }

      // Find the payment record created during order creation
      const payment = await Payment.findOne({ razorpayOrderId: orderId });

      if (!payment) {
        console.warn(`Webhook received for order ${orderId} but no Payment record exists in DB`);
        return NextResponse.json({ success: true, message: "Payment record not found" });
      }

      // If already paid, return success (idempotency)
      if (payment.status === "paid") {
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      // Update the Payment record to "paid"
      if (paymentId) {
        payment.razorpayPaymentId = paymentId;
      }
      payment.status = "paid";
      await payment.save();

      // Update user's phone number if available
      if (contactPhone) {
        const { User } = await import("@/models");
        await User.findByIdAndUpdate(payment.userId, {
          phoneNumber: contactPhone,
        });
      }

      // Auto-register the user for the event
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
            { upsert: true }
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
            { upsert: true }
          );
        }
        console.log(`Successfully registered user ${payment.userId} for event ${payment.eventId} via Webhook`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
