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
    <div className="min-h-full">
      <h1 className="text-5xl font-semibold">Your Settings</h1>
      <div className="mt-2 mb-10 text-[#717171]">
        Manage your profile and account preferences
      </div>
      <div className="w-full mt-20">
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
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-200 bg-white/5 md:bg-transparent hover:bg-white/5 transition-colors"
            >
              <CircleUser className="h-5 w-5 text-zinc-400" />
              <span>Edit Profile</span>
            </Link>

            <button
              type="button"
              className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-500 bg-white/5 md:bg-transparent"
            >
              <Bell className="h-5 w-5 text-zinc-600" />
              <span>Notifications</span>
            </button>

            <button
              type="button"
              className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-500 bg-white/5 md:bg-transparent"
            >
              <ReceiptText className="h-5 w-5 text-zinc-600" />
              <span>Event History</span>
            </button>

            <Link
              href="/help"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-200 bg-white/5 md:bg-transparent hover:bg-white/5 transition-colors"
            >
              <CircleHelp className="h-5 w-5 text-zinc-400" />
              <span>FAQ</span>
            </Link>

            <button
              type="button"
              className="w-full text-left flex items-center gap-3 rounded-xl px-4 py-3 text-base text-zinc-500 bg-white/5 md:bg-transparent"
            >
              <GraduationCap className="h-5 w-5 text-zinc-400" />
              <span>About App</span>
            </button>
          </div>

          <div className="pt-8 flex justify-center">
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/login" });
              }}
            >
              <button
                type="submit"
                className="flex items-center gap-2 rounded-full px-3 py-2 text-black bg-white font-extrabold hover:cursor-pointer"
              >
                <Power className="h-5 w-5 font-extrabold" />
                <span>Logout</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
