"use client";
import Script from "next/script";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentProps {
  amount: number;
  eventId: string;
  groupId?: string;
  customQuestionAnswers?: {
    questionId: string;
    answer: string | string[];
  }[];
  autoStartTrigger?: number;
  text?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export default function Payment({
  amount,
  eventId,
  groupId,
  customQuestionAnswers,
  autoStartTrigger,
  text,
  className,
  disabled,
  onSuccess,
}: PaymentProps) {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isRazorpayReady, setIsRazorpayReady] = useState(false);
  const [queuedAutoStart, setQueuedAutoStart] = useState(false);
  const lastAutoStartTrigger = useRef<number | undefined>(undefined);

  const handlePayment = async (suppressNotReadyAlert = false) => {
    if (typeof window === "undefined" || !window.Razorpay || !isRazorpayReady) {
      if (!suppressNotReadyAlert) {
        alert("Payment gateway is still loading. Please try again in a moment.");
      }
      setQueuedAutoStart(true);
      return;
    }

    if (paymentLoading) {
      return;
    }

    setQueuedAutoStart(false);
    setPaymentLoading(true);

    try {
      // Create order (server validates amount from event.registrationFee)
      const response = await fetch("/api/razorpay/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          groupId: groupId || undefined,
          customQuestionAnswers: customQuestionAnswers ?? [],
        }),
      });

      const orderData = await response.json();

      if (!response.ok) {
        // Handle "already paid" — re-register then redirect
        if (response.status === 409) {
          toast.success("You've already paid — re-registering you now!");
          await fetch("/api/events/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              eventId,
              ...(groupId ? { groupId } : {}),
              customQuestionAnswers: customQuestionAnswers ?? [],
            }),
          });
          onSuccess?.();
          return;
        }
        throw new Error(orderData.error || orderData.details || "Failed to create order");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Clubly",
        description: "",
        order_id: orderData.id,
        handler: async function (response: any) {
          try {
            const verificationResponse = await fetch(
              "/api/razorpay/verify-payment",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              },
            );

            const verificationData = await verificationResponse.json();

            if (verificationData.success) {
              onSuccess?.();
            } else {
              alert("Payment verification failed");
            }
          } finally {
            setPaymentLoading(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaymentLoading(false);
          },
        },

        theme: {
          color: "#37AFA2",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error("Payment error:", error);
      setPaymentLoading(false);
      alert(error.message || "Payment failed. Please try again.");
      return;
    }
  };

  useEffect(() => {
    if (!isRazorpayReady || !queuedAutoStart || disabled || paymentLoading) {
      return;
    }
    void handlePayment(true);
  }, [isRazorpayReady, queuedAutoStart, disabled, paymentLoading]);

  useEffect(() => {
    if (
      autoStartTrigger === undefined ||
      autoStartTrigger === lastAutoStartTrigger.current
    ) {
      return;
    }

    lastAutoStartTrigger.current = autoStartTrigger;
    if (!disabled && !paymentLoading) {
      void handlePayment(true);
    }
  }, [autoStartTrigger, disabled, paymentLoading]);

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setIsRazorpayReady(true)}
      />
      <button
        onClick={() => {
          void handlePayment();
        }}
        disabled={disabled || paymentLoading}
        className={`${className || ""} ${
          paymentLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {paymentLoading ? "Processing..." : text}
      </button>
    </>
  );
}
