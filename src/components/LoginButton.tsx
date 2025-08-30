"use client";
import { signIn } from "next-auth/react";

export default function LoginButton() {
  return (
    <div>
      <button
        onClick={() => signIn("google", { redirectTo: "/dashboard" })}
        className="hover:cursor-pointer"
      >
        Login
      </button>
    </div>
  );
}
