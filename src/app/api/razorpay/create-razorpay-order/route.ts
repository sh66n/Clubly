// app/api/razorpay/create-razorpay-order/route.ts
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Event, Payment } from "@/models";
import { NextResponse } from "next/server";
import Razorpay from "razorpay";

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
    const { eventId, groupId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 },
      );
    }

    await connectToDb();

    // Look up the event to get the real registration fee
    const event = await Event.findById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
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
