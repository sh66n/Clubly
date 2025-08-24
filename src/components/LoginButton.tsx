"use client";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <div>
      <button onClick={() => signIn("google", { redirectTo: "/dashboard" })}>
        Sign in
      </button>
    </div>
  );
}
