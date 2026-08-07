"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Filter, User as UserIcon } from "lucide-react";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function DemographicsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [eventName, setEventName] = useState("Loading...");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/club-admin/events/${eventId}/details`);
      if (!res.ok) throw new Error("Failed to load details");
      const data = await res.json();
      setEventName(data.event?.name || "Event");
      
      const allUsers = new Map();
      
      (data.registrations || []).forEach((reg: any) => {
        if (reg.userId) {
          allUsers.set(reg.userId._id, { ...reg.userId, type: "Individual" });
        } else if (reg.groupId && reg.groupId.members) {
          reg.groupId.members.forEach((m: any) => {
             allUsers.set(m._id, { ...m, type: "Team Member", teamName: reg.groupId.name });
          });
        }
      });
      
      setUsers(Array.from(allUsers.values()));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) fetchDetails();
  }, [eventId, fetchDetails]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchDept = selectedDept ? (u.department || "Not Specified") === selectedDept : true;
      return matchDept;
    });
  }, [users, selectedDept]);

  const departmentStats = useMemo(() => {
    const stats: Record<string, number> = {};
    users.forEach((u) => {
      const dept = u.department || "Not Specified";
      stats[dept] = (stats[dept] || 0) + 1;
    });
    return Object.fromEntries(
      Object.entries(stats).sort(([, a], [, b]) => b - a)
    );
  }, [users]);

  const pieData = useMemo(() => ({
    labels: Object.keys(departmentStats),
    datasets: [
      {
        data: Object.values(departmentStats),
        backgroundColor: [
          "#7CB342", "#00BCD4", "#3F51B5", "#9C27B0", "#FF9800", "#F44336", "#E91E63", "#4CAF50",
        ],
        borderWidth: 2,
        borderColor: "#ffffff",
      },
    ],
  }), [departmentStats]);

  const handlePieClick = useCallback((event: any, elements: any[]) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const label = pieData.labels[index];
      setSelectedDept(prev => prev === label ? null : label); // toggle
    }
  }, [pieData.labels]);

  const pieOptions = useMemo(() => ({
    plugins: {
      legend: { display: false },
    },
    cutout: "70%",
    maintainAspectRatio: false,
    onClick: handlePieClick,
  }), [handlePieClick]);

  if (loading) return <div className="flex justify-center min-h-screen pt-20"><ClublyLoader /></div>;
  if (error) return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-650 transition-colors outline-none mb-6"
      >
        <ArrowLeft size={14} /> Back to Event
      </button>
        {/* Demographics Overview */}
        <div className="mb-10 flex flex-col items-center">
          <div className="h-56 w-full max-w-sm relative cursor-pointer">
            {users.length > 0 ? (
              <Pie data={pieData} options={pieOptions} />
            ) : (
              <div className="w-full h-full rounded-full border-4 border-slate-200/50 flex items-center justify-center">
                <span className="text-xs font-medium text-slate-400">No Data</span>
              </div>
            )}
            {users.length > 0 && (
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none mt-2">
                <span className="text-4xl font-bold text-slate-800 leading-none">{users.length}</span>
                <span className="text-xs text-slate-500 font-medium mt-1">Total Users</span>
              </div>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-4 font-medium">Click a slice to filter by department</p>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800">
            {filteredUsers.length} {filteredUsers.length === 1 ? "Student" : "Students"} found
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredUsers.map(user => (
            <div key={user._id} className="bg-white border border-slate-200/60 rounded-2xl p-4 flex items-center gap-3 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-full bg-slate-100 shrink-0 overflow-hidden border border-slate-200">
                {user.image ? <img src={user.image} className="w-full h-full object-cover" /> : <UserIcon className="m-auto mt-3 text-slate-400" size={20} />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-800 truncate" title={user.name}>{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate" title={user.department || "Not Specified"}>{user.department || "Not Specified"}</p>
                {user.type === "Team Member" && (
                  <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider text-[#7CB342] bg-[#f0f7e6] px-1.5 py-0.5 rounded border border-[#c5d6a8]">
                    Team: {user.teamName}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {filteredUsers.length === 0 && (
          <div className="text-center py-20">
            <Filter className="mx-auto text-slate-300 mb-3" size={32} />
            <h3 className="text-slate-600 font-bold">No students found</h3>
            <p className="text-slate-400 text-xs mt-1">Try adjusting your filters</p>
          </div>
      )}
    </div>
  );
}
