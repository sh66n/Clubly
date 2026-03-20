import React from "react";

export default function MePageSkeleton() {
  return (
    <div className="min-h-full">
      {/* Heading */}
      <h1 className="text-5xl font-semibold">Your Settings</h1>
      <div className="mt-2 mb-10 text-[#717171]">
        Manage your profile and account preferences
      </div>

      <div className="w-full mt-20 animate-pulse">
        <div className="mx-auto w-full max-w-md flex flex-col">
          {/* Profile Section */}
          <div className="flex items-center gap-4 pb-6 sm:pb-8">
            <div className="h-14 w-14 rounded-full bg-white/5" />

            <div className="flex flex-col gap-2 w-full">
              <div className="h-4 w-40 bg-white/5 rounded-md" />
              <div className="h-3 w-56 bg-white/5 rounded-md" />
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-2 w-full">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-4 py-3"
              >
                <div className="h-5 w-5 rounded-md bg-white/5" />
                <div className="h-4 w-40 bg-white/5 rounded-md" />
              </div>
            ))}
          </div>

          {/* Logout Button */}
          <div className="pt-8 flex justify-center">
            <div className="flex items-center gap-2 rounded-full px-4 py-3 bg-white/5">
              <div className="h-5 w-5 rounded-md bg-white/10" />
              <div className="h-4 w-20 bg-white/10 rounded-md" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
