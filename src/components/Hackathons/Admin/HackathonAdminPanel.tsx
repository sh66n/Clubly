"use client";
import React, { useState } from "react";
import { LayoutDashboard, List, FileText, CheckSquare, Settings } from "lucide-react";
import RoundManager from "./RoundManager";
import SubmissionsTable from "./SubmissionsTable";
import ShortlistingPanel from "./ShortlistingPanel";
import EditHackathonForm from "../EditHackathonForm";

export default function HackathonAdminPanel({ hackathon, rounds, fetchDetails }: { hackathon: any, rounds: any[], fetchDetails: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "rounds", label: "Rounds", icon: List },
    { id: "submissions", label: "Submissions", icon: FileText },
    { id: "shortlist", label: "Shortlisting", icon: CheckSquare },
    { id: "settings", label: "Edit / Settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      <div className="bg-white border-b border-slate-200 px-6 pt-4">
        <h1 className="text-2xl font-bold text-slate-800 mb-4">{hackathon.name} - Admin Panel</h1>
        
        <div className="flex items-center gap-6 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id 
                  ? "border-[#7CB342] text-[#7CB342]" 
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
              }`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Total Teams</p>
              <p className="text-3xl font-bold text-slate-800 mt-2">{hackathon.teamsCount || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Total Submissions</p>
              <p className="text-3xl font-bold text-[#7CB342] mt-2">{hackathon.submissionsCount || 0}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-sm text-slate-500 font-medium">Status</p>
              <p className="text-3xl font-bold text-slate-800 mt-2 capitalize">{hackathon.status}</p>
            </div>
          </div>
        )}

        {activeTab === "rounds" && (
          <RoundManager hackathonId={hackathon._id} rounds={rounds} fetchDetails={fetchDetails} />
        )}

        {activeTab === "submissions" && (
          <SubmissionsTable hackathonId={hackathon._id} rounds={rounds} />
        )}

        {activeTab === "shortlist" && (
          <ShortlistingPanel hackathonId={hackathon._id} rounds={rounds} fetchDetails={fetchDetails} />
        )}

        {activeTab === "settings" && (
          <div className="max-w-4xl">
            <EditHackathonForm hackathon={hackathon} onSuccess={fetchDetails} />
          </div>
        )}
      </div>
    </div>
  );
}
