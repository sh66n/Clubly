"use client";

import React, { useState } from "react";
import PerformanceChart from "@/components/SuperAdmin/PerformanceChart";
import ActivityFeed from "@/components/SuperAdmin/ActivityFeed";
import AdminAssignModal from "@/components/SuperAdmin/AdminAssignModal";
import Link from "next/link";
import { ChevronDown, ArrowUpRight, UserPlus, Users, Calendar } from "lucide-react";

interface SuperAdminDashboardClientProps {
  stats: any;
  clubs: any[];
}

export default function SuperAdminDashboardClient({
  stats,
  clubs,
}: SuperAdminDashboardClientProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "tech" | "cult">("all");

  const filteredClubs = clubs.filter((c) => {
    if (selectedFilter === "all") return true;
    const dept = (c.department || "").toLowerCase();
    if (selectedFilter === "tech") {
      return dept.includes("computer") || dept.includes("it") || dept.includes("tech");
    }
    return !dept.includes("computer") && !dept.includes("it");
  });

  return (
    <div className="h-full flex flex-col justify-between gap-3 font-sans">
      
      {/* Category Pills: All Clubs, Tech Societies, Cultural */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedFilter === "all"
                ? "bg-gradient-to-r from-[#6e465c] via-[#5b3b4d] to-[#452d3a] text-white shadow-[0_4px_16px_rgba(110,70,92,0.3)] border border-[#83566e]/40"
                : "bg-[#1e1d24] text-[#8e8d9e] border border-[#2a2935] hover:text-white"
            }`}
          >
            All Societies ({clubs.length})
          </button>
          <button
            onClick={() => setSelectedFilter("tech")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedFilter === "tech"
                ? "bg-gradient-to-r from-[#6e465c] via-[#5b3b4d] to-[#452d3a] text-white shadow-[0_4px_16px_rgba(110,70,92,0.3)] border border-[#83566e]/40"
                : "bg-[#1e1d24] text-[#8e8d9e] border border-[#2a2935] hover:text-white"
            }`}
          >
            Technical Clubs
          </button>
          <button
            onClick={() => setSelectedFilter("cult")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedFilter === "cult"
                ? "bg-gradient-to-r from-[#6e465c] via-[#5b3b4d] to-[#452d3a] text-white shadow-[0_4px_16px_rgba(110,70,92,0.3)] border border-[#83566e]/40"
                : "bg-[#1e1d24] text-[#8e8d9e] border border-[#2a2935] hover:text-white"
            }`}
          >
            Cultural &amp; Sports
          </button>
        </div>

        <button
          onClick={() => setAssignModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#2a1d25] border border-[#482c3c] text-[#f1d5e3] hover:bg-[#382431] transition-colors"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Appoint Club Admin</span>
        </button>
      </div>

      {/* Middle 3 Columns Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 flex-1 min-h-0">
        
        {/* Left Column (Span 4): Campus Metrics + Quick Appoint Card */}
        <div className="lg:col-span-4 flex flex-col gap-3 h-full">
          
          {/* Card 1: Total Registered Students */}
          <div className="bg-[#18181d] border border-[#26252e] rounded-[24px] p-5 flex flex-col justify-between flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-medium text-[#7d7c8c]">
                Registered Campus Students
              </span>
              <div className="flex items-center gap-1.5 bg-[#201f27] border border-[#2d2c38] px-3 py-0.5 rounded-full text-xs text-[#a2a1b1]">
                <span>All Years</span>
                <ChevronDown className="h-3 w-3 text-[#797887]" />
              </div>
            </div>

            <div className="my-auto">
              <span className="text-[34px] font-bold text-[#f5f5fa] tracking-tight">
                {stats.totalStudents.toLocaleString()}
              </span>
              <span className="text-xs text-[#34d399] font-medium block mt-1">
                Verified college student accounts
              </span>
            </div>

            <p className="text-[10.5px] text-[#717080]">
              {stats.activeAdminsCount} appointed club leaders managing campus events
            </p>
          </div>

          {/* Card 2: Club Leadership Action Card */}
          <div className="bg-[#18181d] border border-[#26252e] rounded-[24px] p-5 relative overflow-hidden flex flex-col justify-between flex-1">
            <div className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 w-44 h-24 bg-[#8d5272]/30 blur-2xl rounded-full" />

            <div className="relative z-10">
              <h3 className="text-[14.5px] font-semibold text-[#f0eff8] tracking-tight">
                Club Administration Command
              </h3>
              <p className="text-[11px] text-[#7b7a8a] mt-1 leading-relaxed">
                Appoint new club admins, switch responsibilities, and coordinate with faculty across all departments.
              </p>
            </div>

            <div className="relative z-10 mt-3">
              <button
                onClick={() => setAssignModalOpen(true)}
                className="w-full py-2 px-4 rounded-full bg-gradient-to-r from-[#6e465c] via-[#85536e] to-[#6e465c] text-white text-xs font-medium flex items-center justify-center gap-2 shadow-[0_4px_16px_rgba(110,70,92,0.4)] hover:opacity-95 transition-opacity"
              >
                <UserPlus className="h-3.5 w-3.5" />
                Assign Club Leaders
              </button>
            </div>
          </div>

        </div>

        {/* Middle Column (Span 4): Live Campus Activity Stream */}
        <div className="lg:col-span-4 bg-[#18181d] border border-[#26252e] rounded-[24px] p-5 flex flex-col justify-between h-full overflow-hidden">
          <div className="flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between pb-2 shrink-0">
              <h3 className="text-[14.5px] font-semibold text-[#f5f5fa]">
                Live Campus Activity
              </h3>
              <Link
                href="/super-admin/activity"
                className="text-[10.5px] text-[#c78ba8] hover:underline"
              >
                View all &rarr;
              </Link>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar mt-2 pr-1">
              <ActivityFeed initialActivities={stats.recentActivities} />
            </div>
          </div>
        </div>

        {/* Right Column (Span 4): Campus Clubs Grid */}
        <div className="lg:col-span-4 bg-[#18181d] border border-[#26252e] rounded-[24px] p-5 flex flex-col justify-between h-full">
          <div>
            <div className="flex items-center justify-between pb-3">
              <h3 className="text-[14.5px] font-semibold text-[#f5f5fa]">
                Campus Societies
              </h3>
              <Link
                href="/super-admin/clubs"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#201f27] border border-[#2d2c38] text-xs text-[#8e8d9e] hover:text-white transition-colors"
              >
                <span>See all</span>
                <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>

            {/* 2x2 Real Club Cards */}
            <div className="grid grid-cols-2 gap-2">
              {filteredClubs.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="bg-[#1e1d24] border border-[#282732] rounded-[18px] p-3 flex flex-col justify-between hover:border-[#383745] transition-colors"
                >
                  <div>
                    <span className="text-[13px] font-bold text-[#f5f5fa] block truncate">
                      {c.name}
                    </span>
                    <span className="text-[10.5px] text-[#34d399] font-medium block mt-0.5">
                      {c.admins.length} {c.admins.length === 1 ? "Admin" : "Admins"}
                    </span>
                  </div>

                  <div className="pt-2 flex items-center justify-between text-[10px] text-[#717080]">
                    <span className="truncate">{c.department.split(" ")[0]}</span>
                    <button
                      onClick={() => setAssignModalOpen(true)}
                      className="text-[9.5px] text-[#c78ba8] hover:underline"
                    >
                      Manage
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-[#22212a] flex items-center justify-between text-[11px] text-[#717080]">
            <span>{stats.totalClubs} Total Clubs</span>
            <span className="text-[#a7718e] font-medium">{stats.totalEvents} Organized Events</span>
          </div>
        </div>

      </div>

      {/* Bottom Wide Panel: Campus Event Registrations Trajectory */}
      <div className="bg-[#18181d] border border-[#26252e] rounded-[26px] p-5 shrink-0">
        <div className="flex items-center justify-between pb-2">
          <div>
            <h3 className="text-[15px] font-semibold text-[#f5f5fa]">
              Campus Participation &amp; Engagement Trajectory
            </h3>
            <p className="text-[11px] text-[#717080] mt-0.5">
              Monthly student registrations trajectory across events and hackathons
            </p>
          </div>

          <div className="flex items-center gap-1 text-xs text-[#a2a1b1]">
            <Calendar className="h-3.5 w-3.5 text-[#9e6283]" />
            <span>Last 6 Months Trajectory</span>
          </div>
        </div>

        {/* Real Dynamic Sparkline Curve */}
        <div className="h-[150px] w-full mt-1">
          <PerformanceChart data={stats.monthlyPerformance} />
        </div>
      </div>

      {/* Interactive Modal for Leadership Assignment */}
      <AdminAssignModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        clubs={clubs}
      />

    </div>
  );
}
