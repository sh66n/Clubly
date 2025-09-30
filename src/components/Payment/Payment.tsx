"use client";
import Script from "next/script";
import React, { useState, useEffect } from "react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PaymentProps {
  amount: number;
  text?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onSuccess?: () => void;
}

export default function Payment({
  amount,
  text,
  className,
  disabled,
  onSuccess,
}: PaymentProps) {
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  useEffect(() => {
    // Load Razorpay script dynamically
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!razorpayLoaded) {
      alert("Payment gateway is still loading. Please try again in a moment.");
      return;
    }

    setPaymentLoading(true);

    try {
      // Create order
      const response = await fetch("/api/razorpay/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amount * 100, // Razorpay expects amount in paise
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const orderData = await response.json();
      if (orderData.error) throw new Error(orderData.details);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Clubly",
        description: "Campus Club Management System",
        order_id: orderData.id,
        handler: async function (response: any) {
          const verificationResponse = await fetch(
            "/api/razorpay/verify-payment",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                amount: orderData.amount,
              }),
            }
          );

          const verificationData = await verificationResponse.json();
          if (verificationData.success) {
            if (onSuccess) onSuccess();
          } else {
            alert("Payment verification failed. Please try again.");
          }
        },
        theme: {
          color: "#37AFA2",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please try again.");
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="beforeInteractive"
      />
      <button
        onClick={handlePayment}
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
