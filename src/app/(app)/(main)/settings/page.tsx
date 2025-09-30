// app/(app)/settings/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function SettingsPage(): JSX.Element {
  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/profile" className="block">
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-gray-700 hover:translate-y-[-4px] transition-transform">
              <h2 className="text-lg font-semibold text-white mb-1">Manage Profile</h2>
              <p className="text-sm text-gray-300">Update your name, photo, and contact information.</p>
            </div>
          </Link>

          <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-1">Account</h2>
            <p className="text-sm text-gray-300">Change password, enable 2FA, manage sessions.</p>
          </div>

          <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-1">Notifications</h2>
            <p className="text-sm text-gray-300">Manage email and push notification preferences.</p>
          </div>
        </div>

        {/* Additional settings sections */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Preferences</h3>
            <p className="text-sm text-gray-300">Theme, default landing page, and other preferences.</p>
          </div>

          <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-2">Privacy</h3>
            <p className="text-sm text-gray-300">Control profile visibility and data sharing.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
