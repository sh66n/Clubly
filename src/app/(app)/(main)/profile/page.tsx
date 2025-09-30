// src/app/(app)/profile/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Simple client-side profile editor that stores data in localStorage.
 * No backend required.
 */

type UserProfile = {
  name: string;
  email: string;
  branch?: string;
  division?: string;
  currentYear?: string;
  phone?: string;
  address?: string;
  personalMail?: string;
  points?: number;
  bio?: string;
  avatar?: string;
};

const LOCAL_KEY = "clubly_user_profile";

const defaultProfile: UserProfile = {
  name: "Sakshi Patil",
  email: "sakshi.patil@example.com",
  branch: "Computer Engineering",
  division: "A", // example
  currentYear: "3rd Year",
  phone: "",
  address: "",
  personalMail: "",
  points: 1200,
  bio:
    "Enthusiastic computer engineering student passionate about coding, cloud, and AI. Active participant in hackathons and club events.",
  avatar: "/images/avatar.png", // make sure file exists or change path
};

export default function ProfilePage(): JSX.Element {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<UserProfile>(defaultProfile);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as UserProfile;
        setProfile((p) => ({ ...p, ...parsed }));
      }
    } catch (err) {
      // ignore parse errors
    }
  }, []);

  // When entering edit mode, seed form with current profile
  useEffect(() => {
    if (isEditing) {
      setForm(profile);
    } else {
      setSavedMessage(null);
    }
  }, [isEditing, profile]);

  // simple validation helpers
  const isValidEmail = (s?: string) =>
    !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
  const isValidPhone = (s?: string) =>
    !s || /^[0-9+\-()\s]{6,20}$/.test(s); // allow plus, spaces, hyphen

  const handleSave = () => {
    // validate
    if (!form.name || !form.email) {
      alert("Please provide at least name and email.");
      return;
    }
    if (!isValidEmail(form.email)) {
      alert("Please provide a valid email address.");
      return;
    }
    if (!isValidPhone(form.phone)) {
      alert("Please provide a valid phone number (digits and + - allowed).");
      return;
    }

    // persist
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(form));
      setProfile(form);
      setIsEditing(false);
      setSavedMessage("Profile saved locally.");
      // subtle visual confirmation
      setTimeout(() => setSavedMessage(null), 3000);
    } catch (err) {
      alert("Failed to save profile in localStorage.");
    }
  };

  const handleResetLocal = () => {
    if (!confirm("Reset profile to defaults? (This will overwrite local changes)")) return;
    localStorage.removeItem(LOCAL_KEY);
    setProfile(defaultProfile);
    setForm(defaultProfile);
    setIsEditing(false);
    setSavedMessage("Reset to defaults.");
    setTimeout(() => setSavedMessage(null), 2500);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Link href="/settings" className="text-sm text-gray-300 hover:text-white">
            ← Back to Settings
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Profile card */}
          <div>
            <div className="bg-black/40 backdrop-blur-md rounded-xl p-6 border border-gray-700">
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-gray-600 mb-4">
                  <Image
                    src={profile.avatar ?? defaultProfile.avatar}
                    alt={profile.name}
                    width={112}
                    height={112}
                    className="object-cover"
                  />
                </div>

                <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
                <p className="text-sm text-blue-400 mb-1">{profile.branch}</p>
                <p className="text-sm text-gray-300">{profile.currentYear} • Student</p>

                <div className="mt-4 text-center">
                  <p className="text-yellow-400 font-bold">{profile.points ?? 0} Points</p>
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                  >
                    Edit Profile
                  </button>

                  <button
                    onClick={() => window.location.href = "/settings"}
                    className="px-4 py-2 rounded-full border border-gray-600 text-sm text-gray-300"
                  >
                    Account Settings
                  </button>
                </div>
              </div>
            </div>

            {/* quick stats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-black/30 p-3 rounded-lg text-center border border-gray-700">
                <div className="text-lg font-semibold">{profile.points ?? 0}</div>
                <div className="text-xs text-gray-300">Points</div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg text-center border border-gray-700">
                <div className="text-lg font-semibold">12</div>
                <div className="text-xs text-gray-300">Events</div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg text-center border border-gray-700">
                <div className="text-lg font-semibold">3</div>
                <div className="text-xs text-gray-300">Clubs</div>
              </div>
            </div>

            <div className="mt-4">
              <button
                onClick={handleResetLocal}
                className="text-sm text-red-400 underline"
                title="Clear saved local profile and restore defaults"
              >
                Reset local profile
              </button>
            </div>

            {savedMessage && (
              <div className="mt-3 text-sm text-green-400">{savedMessage}</div>
            )}
          </div>

          {/* RIGHT: Overview or Edit form */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-6">
                <button className={`pb-2 text-sm font-medium ${!isEditing ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300"}`} onClick={() => setIsEditing(false)}>Overview</button>
                <button className={`pb-2 text-sm font-medium ${isEditing ? "text-blue-400 border-b-2 border-blue-400" : "text-gray-300"}`} onClick={() => setIsEditing(true)}>Edit</button>
                <button className="pb-2 text-sm font-medium text-gray-300">Clubs</button>
                <button className="pb-2 text-sm font-medium text-gray-300">Events</button>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              {!isEditing ? (
                <>
                  <h3 className="text-xl font-semibold mb-3">About</h3>
                  <p className="text-gray-300 leading-relaxed text-justify">{profile.bio}</p>

                  <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm text-gray-400">Email</h4>
                      <p className="text-white">{profile.email}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-400">Role</h4>
                      <p className="text-white">Student</p>
                    </div>

                    <div>
                      <h4 className="text-sm text-gray-400">Branch</h4>
                      <p className="text-white">{profile.branch ?? "Not added"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-400">Division</h4>
                      <p className="text-white">{profile.division ?? "Not added"}</p>
                    </div>

                    <div>
                      <h4 className="text-sm text-gray-400">Phone</h4>
                      <p className="text-white">{profile.phone ?? "Not added"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm text-gray-400">Personal Mail</h4>
                      <p className="text-white">{profile.personalMail ?? "Not added"}</p>
                    </div>

                    <div className="sm:col-span-2">
                      <h4 className="text-sm text-gray-400">Address</h4>
                      <p className="text-white">{profile.address ?? "Not added"}</p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-300">Full name</label>
                      <input
                        value={form.name}
                        onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                        className="w-full mt-1 p-2 rounded bg-black/20 border border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300">Email (official)</label>
                      <input
                        value={form.email}
                        onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                        className="w-full mt-1 p-2 rounded bg-black/20 border border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300">Branch</label>
                      <input
                        value={form.branch}
                        onChange={(e) => setForm((s) => ({ ...s, branch: e.target.value }))}
                        className="w-full mt-1 p-2 rounded bg-black/20 border border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300">Division</label>
                      <input
                        value={form.division}
                        onChange={(e) => setForm((s) => ({ ...s, division: e.target.value }))}
                        className="w-full mt-1 p-2 rounded bg-black/20 border border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300">Current Year</label>
                      <input
                        value={form.currentYear}
                        onChange={(e) => setForm((s) => ({ ...s, currentYear: e.target.value }))}
                        className="w-full mt-1 p-2 rounded bg-black/20 border border-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-sm text-gray-300">Phone</label>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                        className="w-full mt-1 p-2 rounded bg-black/20 border border-gray-700"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-300">Personal Email</label>
                      <input
                        value={form.personalMail}
                        onChange={(e) => setForm((s) => ({ ...s, personalMail: e.target.value }))}
                        className="w-full mt-1 p-2 rounded bg-black/20 border border-gray-700"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-300">Address</label>
                      <textarea
                        value={form.address}
                        onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
                        className="w-full mt-1 p-2 rounded bg-black/20 border border-gray-700"
                        rows={3}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-300">Short bio</label>
                      <textarea
                        value={form.bio}
                        onChange={(e) => setForm((s) => ({ ...s, bio: e.target.value }))}
                        className="w-full mt-1 p-2 rounded bg-black/20 border border-gray-700"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save (local)
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setForm(profile);
                      }}
                      className="px-4 py-2 rounded border border-gray-600 text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
