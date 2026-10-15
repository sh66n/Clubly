"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

import { useTenant } from "@/context/TenantContext";

export default function LoginErrorToast() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const { allowedEmailDomains, name } = useTenant();

  useEffect(() => {
    if (!error) return;

    switch (error) {
      case "unauthorized-domain":
        if (allowedEmailDomains && allowedEmailDomains.length > 0) {
          toast.error(`Only ${allowedEmailDomains.join(", ")} email IDs are allowed for ${name || "this college"}`);
        } else {
          toast.error("Your email domain is not authorized for this portal.");
        }
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
