import BackButton from "@/components/BackButton";
import React from "react";

export default function Loading() {
  return (
    <div className="min-h-full">
      <BackButton />
      <h1 className="text-5xl font-semibold">Edit Profile</h1>
      <div className="mt-2 mb-6 text-[#717171]">
        Update your profile details and information
      </div>
      <div className="max-w-5xl mx-auto py-12 px-6 animate-pulse">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
          {/* LEFT COLUMN */}
          <aside className="lg:w-1/3 space-y-8">
            {/* Heading */}
            <div className="space-y-3">
              <div className="h-8 w-48 bg-white/5 rounded-lg" />
              <div className="h-4 w-64 bg-white/5 rounded-md" />
            </div>

            {/* Avatar */}
            <div className="w-32 h-32 lg:w-44 lg:h-44 rounded-3xl bg-white/5" />
          </aside>

          {/* RIGHT COLUMN */}
          <div className="flex-1 space-y-12">
            {/* Personal Info */}
            <section className="space-y-6">
              <div className="h-3 w-48 bg-white/5 rounded-md" />

              <div className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                  <div className="h-3 w-24 bg-white/5 rounded-md" />
                  <div className="h-10 w-full bg-white/5 rounded-xl" />
                </div>

                {/* Dept + Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="h-3 w-28 bg-white/5 rounded-md" />
                    <div className="h-10 w-full bg-white/5 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-white/5 rounded-md" />
                    <div className="h-10 w-full bg-white/5 rounded-xl" />
                  </div>
                </div>
              </div>
            </section>

            {/* Contact */}
            <section className="space-y-6">
              <div className="h-3 w-40 bg-white/5 rounded-md" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Phone */}
                <div className="space-y-2">
                  <div className="h-3 w-28 bg-white/5 rounded-md" />
                  <div className="h-10 w-full bg-white/5 rounded-xl" />
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <div className="h-3 w-32 bg-white/5 rounded-md" />
                  <div className="h-10 w-full bg-white/5 rounded-xl" />
                </div>
              </div>

              {/* College */}
              <div className="pt-2 space-y-2">
                <div className="h-3 w-24 bg-white/5 rounded-md" />
                <div className="h-10 w-full bg-white/5 rounded-xl" />
              </div>
            </section>

            {/* Actions */}
            <div className="pt-10 flex items-center justify-end gap-10">
              <div className="h-4 w-16 bg-white/5 rounded-md" />
              <div className="h-10 w-40 bg-white/5 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
