"use client";

import React from "react";
import { Mail, Phone, MapPin, GraduationCap, Building2, UserCircle } from "lucide-react";

interface ProfileOverviewTabProps {
  user: {
    name: string;
    email: string;
    role: string;
    college?: string;
    department?: string;
    year?: number;
    division?: string;
    phone?: string;
    personalMail?: string;
    address?: string;
    bio?: string;
  };
}

export default function ProfileOverviewTab({ user }: ProfileOverviewTabProps) {
  const yearLabels: Record<number, string> = {
    1: "First Year (FE)",
    2: "Second Year (SE)",
    3: "Third Year (TE)",
    4: "Fourth Year (BE)",
  };

  return (
    <div className="space-y-6">
      {/* About / Bio section */}
      <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
        <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
          <UserCircle className="w-4 h-4 text-cyan-400" />
          About Student
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {user.bio && user.bio.trim().length > 0
            ? user.bio
            : "No bio added yet. An enthusiastic student active in campus community events, technical competitions, and club workshops."}
        </p>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Academic Card */}
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-violet-400" /> Academic Information
          </h4>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block">Department / Branch</span>
              <span className="text-white font-medium">
                {user.department || "Computer Engineering"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-xs text-slate-400 block">Academic Year</span>
                <span className="text-white font-medium">
                  {user.year ? yearLabels[user.year] || `Year ${user.year}` : "Student"}
                </span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Division</span>
                <span className="text-white font-medium">
                  {user.division || "Not specified"}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 block">College / Institution</span>
              <span className="text-white font-medium">
                {user.college || "Campus Member"}
              </span>
            </div>
          </div>
        </div>

        {/* Contact & Personal Card */}
        <div className="p-5 rounded-2xl border border-white/10 bg-white/[0.02] space-y-4">
          <h4 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-400" /> Contact & Verification
          </h4>

          <div className="space-y-3 text-sm">
            <div>
              <span className="text-xs text-slate-400 block flex items-center gap-1">
                <Mail className="w-3 h-3" /> College Email
              </span>
              <span className="text-white font-medium break-all">{user.email}</span>
            </div>

            {user.personalMail && (
              <div>
                <span className="text-xs text-slate-400 block flex items-center gap-1">
                  <Mail className="w-3 h-3" /> Personal Email
                </span>
                <span className="text-white font-medium break-all">{user.personalMail}</span>
              </div>
            )}

            {user.phone && (
              <div>
                <span className="text-xs text-slate-400 block flex items-center gap-1">
                  <Phone className="w-3 h-3" /> Phone
                </span>
                <span className="text-white font-medium">{user.phone}</span>
              </div>
            )}

            {user.address && (
              <div>
                <span className="text-xs text-slate-400 block flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Location
                </span>
                <span className="text-white font-medium">{user.address}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
