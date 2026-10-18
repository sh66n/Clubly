"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <div>
      <button
        className="hover:cursor-pointer hover:text-white"
        onClick={async () => {
          await signOut({ redirect: false });
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
}
