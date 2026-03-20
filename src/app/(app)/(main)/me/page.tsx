import { auth, signOut } from "@/auth";
import Link from "next/link";
import React from "react";
import {
  Bell,
  CircleHelp,
  CircleUser,
  GraduationCap,
  Power,
  ReceiptText,
} from "lucide-react";

export default async function MePage() {
  const session = await auth();

  return (
    <div className="min-h-full w-full px-4 py-6 sm:py-8">
      <h1 className="text-5xl font-semibold">Your Settings</h1>
      <div className="mt-2 mb-6 text-[#717171]">
        Manage your profile and account preferences
      </div>

      <div className="mx-auto w-full max-w-md flex flex-col">
        <div className="flex items-center gap-4 pb-6 sm:pb-8">
          {session?.user?.image ? (
            <img
              src={session.user.image}
              alt={session.user.name || "Profile image"}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="h-14 w-14 rounded-full bg-zinc-800" />
          )}

          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-white">
              {session?.user?.name || "My Profile"}
            </div>
            <div className="truncate text-sm text-zinc-400">
              {session?.user?.email || ""}
            </div>
          </div>
        </div>

        <div className="space-y-2 w-full">
          <Link
            href="/me/edit"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <CircleUser className="h-5 w-5 text-zinc-400" />
            <span>Edit Profile</span>
          </Link>

          <button
            type="button"
            className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-500"
          >
            <Bell className="h-5 w-5 text-zinc-600" />
            <span>Notifications</span>
          </button>

          <button
            type="button"
            className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-500"
          >
            <ReceiptText className="h-5 w-5 text-zinc-600" />
            <span>Transaction History</span>
          </button>

          <Link
            href="/help"
            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-200 hover:bg-zinc-900 transition-colors"
          >
            <CircleHelp className="h-5 w-5 text-zinc-400" />
            <span>FAQ</span>
          </Link>

          <button
            type="button"
            className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-500"
          >
            <GraduationCap className="h-5 w-5 text-zinc-400" />
            <span>About App</span>
          </button>
        </div>

        <div className="pt-8">
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-base text-red-500 hover:bg-red-500/10 transition-colors"
            >
              <Power className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
