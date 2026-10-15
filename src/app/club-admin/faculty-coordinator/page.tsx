"use client";
import React, { useState, useEffect } from "react";
import { GraduationCap, Mail, UserCheck, UserX, ShieldAlert, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";

interface FacultyCoordinatorData {
  _id: string;
  name: string;
  email: string;
  image?: string;
  department?: string;
  year?: number;
  phoneNumber?: string;
}

export default function FacultyCoordinatorManagementPage() {
  const [coordinator, setCoordinator] = useState<FacultyCoordinatorData | null>(null);
  const [clubName, setClubName] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [showConfirmRemove, setShowConfirmRemove] = useState(false);

  const fetchCoordinator = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/club-admin/faculty-coordinator");
      if (!res.ok) throw new Error("Failed to load faculty coordinator data");
      const data = await res.json();
      setCoordinator(data.facultyCoordinator);
      setClubName(data.clubName || "Your Club");
    } catch (err: any) {
      toast.error(err.message || "Could not fetch coordinator");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoordinator();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setAssigning(true);
      const res = await fetch("/api/club-admin/faculty-coordinator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailInput.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to assign coordinator");
      }

      toast.success(data.message || "Faculty coordinator assigned successfully!");
      setCoordinator(data.facultyCoordinator);
      setEmailInput("");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setAssigning(false);
    }
  };

  const handleRemove = async () => {
    try {
      setRemoving(true);
      const res = await fetch("/api/club-admin/faculty-coordinator", {
        method: "DELETE",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to remove coordinator");
      }

      toast.success(data.message || "Faculty coordinator removed successfully");
      setCoordinator(null);
      setShowConfirmRemove(false);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setRemoving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClublyLoader />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header card */}
      <div
        className="rounded-2xl p-6 text-white border border-[#2d5c0c] relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 400px 200px at bottom right, #254f0a 0%, #040c00 100%)",
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-[#9ccc65]">
            <GraduationCap size={28} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Faculty Coordinator Management</h1>
            <p className="text-xs md:text-sm text-[#c5d6a8] mt-0.5">
              Assign an official faculty advisor for <span className="font-semibold text-white">{clubName}</span> to oversee compliance and NAAC reports.
            </p>
          </div>
        </div>
      </div>

      {/* Current Coordinator Card or Empty State */}
      {coordinator ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-base font-bold text-slate-800">Current Assigned Coordinator</h2>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#f0f7e6] text-[#7CB342] border border-[#d5e9b8]">
              Active Oversight Role
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-4">
              {coordinator.image ? (
                <img
                  src={coordinator.image}
                  alt={coordinator.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-[#7CB342]/40"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#7CB342]/10 border border-[#7CB342]/30 flex items-center justify-center text-xl font-bold text-[#7CB342]">
                  {coordinator.name?.charAt(0) || "F"}
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold text-slate-900">{coordinator.name}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                  <Mail size={13} className="text-slate-400" />
                  {coordinator.email}
                </p>
                {coordinator.department && (
                  <p className="text-xs font-medium text-slate-600 mt-1">
                    Department: <span className="text-slate-800">{coordinator.department}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowConfirmRemove(true)}
              className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-center"
            >
              <UserX size={15} />
              Remove Coordinator
            </button>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-xs text-slate-600 flex items-start gap-3 mt-4">
            <ShieldAlert size={18} className="text-slate-400 shrink-0 mt-0.5" />
            <p>
              This faculty member has view-only access to your club events, attendance records, student leaderboard, and 1-click NAAC audit reports at <code className="text-[#558b2f] font-mono bg-[#e8f5e9] px-1 py-0.5 rounded">/faculty-coordinator/dashboard</code>. They cannot edit or delete club events.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <UserX size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Faculty Coordinator Assigned</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Assign a faculty member from your college to grant them read-only compliance access for auditing, attendance sign-offs, and NAAC reports.
          </p>
        </div>
      )}

      {/* Assign Coordinator Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <UserCheck size={18} className="text-[#7CB342]" />
          <h2 className="text-base font-bold text-slate-800">
            {coordinator ? "Change Faculty Coordinator" : "Assign Faculty Coordinator"}
          </h2>
        </div>

        <form onSubmit={handleAssign} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1.5">
              Faculty College Email Address
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="faculty.name@college.edu"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
                className="flex-1 px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#7CB342] focus:bg-white transition-all text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={assigning}
                className="px-5 py-2.5 bg-[#7CB342] hover:bg-[#689F38] text-white text-xs font-bold rounded-xl transition-colors disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {assigning ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Assigning…
                  </>
                ) : (
                  <>
                    Assign Coordinator
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              * Note: The faculty member must have signed in to Clubly with Google at least once using their college email.
            </p>
          </div>
        </form>
      </div>

      {/* Modal: Confirm Removal */}
      {showConfirmRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-10 h-10 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
              <UserX size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Remove Faculty Coordinator?</h3>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to revoke {coordinator?.name}’s coordinator access for {clubName}? Their account role will revert to regular user.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmRemove(false)}
                disabled={removing}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-60 flex items-center gap-1.5"
              >
                {removing ? <Loader2 size={14} className="animate-spin" /> : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
