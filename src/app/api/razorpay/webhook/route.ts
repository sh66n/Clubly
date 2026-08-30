import { NextResponse } from "next/server";
import crypto from "crypto";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Payment, Registration, RoundQualification } from "@/models";

export async function POST(request: Request) {
  try {
    const bodyText = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

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

    if (eventName === "order.paid" || eventName === "payment.captured") {
      await connectToDb();

      let orderId = "";
      let paymentId = "";
      let contactPhone = "";

      if (eventName === "order.paid") {
        orderId = eventData.payload.order.entity.id;
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

      const payment = await Payment.findOne({ razorpayOrderId: orderId });

      if (!payment) {
        console.warn(`Webhook received for order ${orderId} but no Payment record exists in DB`);
        return NextResponse.json({ success: true, message: "Payment record not found" });
      }

      if (payment.status === "paid") {
        return NextResponse.json({ success: true, message: "Already processed" });
      }

      if (paymentId) {
        payment.razorpayPaymentId = paymentId;
      }
      payment.status = "paid";
      await payment.save();

      if (contactPhone) {
        const { User } = await import("@/models");
        await User.findByIdAndUpdate(payment.userId, {
          phoneNumber: contactPhone,
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
        }
      } else if (payment.hackathonId && payment.roundId && payment.teamId) {
        await RoundQualification.updateOne(
          { round: payment.roundId, team: payment.teamId },
          { $set: { paymentStatus: "paid" } }
        );
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
