"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function LoginErrorToast() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (!error) return;

    switch (error) {
      case "unauthorized-domain":
        toast.error("Only pvppcoe.ac.in email IDs are allowed");
        break;

      case "missing-email":
        toast.error("Email not found. Please try again.");
        break;

      default:
        toast.error("Login failed. Please try again.");
    }
  }, [error]);

  return null;
}
