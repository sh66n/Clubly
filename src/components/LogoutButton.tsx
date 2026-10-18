"use client";
import { signOut } from "next-auth/react";

export function LogoutButton() {
  return (
    <div>
      <button
        className="hover:cursor-pointer hover:text-white"
        onClick={async () => {
          await signOut({ redirect: false });
          if (
            typeof window !== "undefined" &&
            window.location.hostname.endsWith("clubly.tech")
          ) {
            window.location.href = "https://clubly.tech/logout";
            return;
          }
          window.location.href = "/logout";
        }}
      >
        Logout
      </button>
    </div>
  );
}
