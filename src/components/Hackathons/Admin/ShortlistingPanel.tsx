"use client";
import React, { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, AlertCircle, Save } from "lucide-react";
import { toast } from "sonner";

export default function ShortlistingPanel({ hackathonId, rounds, fetchDetails }: { hackathonId: string, rounds: any[], fetchDetails: () => void }) {
  const [selectedRound, setSelectedRound] = useState<string>(rounds[0]?._id || "");
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // local state for evaluation: map of regId -> status
  const [evaluations, setEvaluations] = useState<Record<string, { status: string, remarks?: string }>>({});

  useEffect(() => {
    if (!selectedRound) return;
    const fetchRegs = async () => {
      setLoading(true);
      try {
        const round = rounds.find(r => r._id === selectedRound);
        if (!round) return;
        const res = await fetch(`/api/club-admin/hackathons/${hackathonId}/registrations?round=${round.roundNumber}`);
        if (res.ok) {
          const data = await res.json();
          setRegistrations(data.registrations || []);
          
          const evs: any = {};
          data.registrations.forEach((r: any) => {
            evs[r._id] = { status: r.status };
          });
          setEvaluations(evs);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegs();
  }, [selectedRound, hackathonId, rounds]);

  const handleStatusChange = (id: string, status: string) => {
    setEvaluations(prev => ({ ...prev, [id]: { ...prev[id], status } }));
  };

  const handleBulkUpdate = async () => {
    setSaving(true);
    try {
      const updates = Object.entries(evaluations).map(([id, data]) => ({
        registrationId: id,
        status: data.status,
      }));

      const res = await fetch(`/api/club-admin/hackathons/${hackathonId}/shortlist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates, roundId: selectedRound }),
      });

      if (!res.ok) throw new Error("Failed to update shortlisting");
      toast.success("Shortlisting updated successfully");
      fetchDetails();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700">Evaluating Round:</label>
          <select 
            value={selectedRound} 
            onChange={e => setSelectedRound(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#7CB342] font-medium text-slate-900 bg-white"
          >
            {rounds.map(r => (
              <option key={r._id} value={r._id}>{r.name} (Round {r.roundNumber})</option>
            ))}
          </select>
        </div>
        <button 
          onClick={handleBulkUpdate}
          disabled={saving || registrations.length === 0}
          className="flex items-center justify-center gap-2 bg-[#7CB342] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#689f38] transition disabled:opacity-50"
        >
          <Save size={16} /> {saving ? "Saving..." : "Save Shortlist"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading teams...</div>
        ) : registrations.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <AlertCircle size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No teams found</p>
            <p className="text-sm">There are no teams to evaluate in this round.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Team</th>
                  <th className="p-4">Members</th>
                  <th className="p-4">Current Status</th>
                  <th className="p-4">Decision</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {registrations.map(reg => {
                  const ev = evaluations[reg._id] || { status: reg.status };
                  return (
                    <tr key={reg._id} className="hover:bg-slate-50/50 transition">
                      <td className="p-4">
                        <p className="font-semibold text-slate-800">{reg.team?.name}</p>
                        <p className="text-xs text-slate-500">Leader: {reg.team?.leader?.name}</p>
                      </td>
                      <td className="p-4">
                        <div className="flex -space-x-2">
                          {reg.team?.members?.slice(0, 3).map((m: any, i: number) => (
                            <div key={i} className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600" title={m.name}>
                              {m.name.charAt(0)}
                            </div>
                          ))}
                          {reg.team?.members?.length > 3 && (
                            <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                              +{reg.team.members.length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                          reg.status === 'winner' ? 'bg-amber-100 text-amber-700' :
                          reg.status === 'active' ? 'bg-blue-100 text-blue-700' :
                          reg.status === 'eliminated' ? 'bg-red-100 text-red-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleStatusChange(reg._id, 'active')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              ev.status === 'active' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            Qualify
                          </button>
                          <button 
                            onClick={() => handleStatusChange(reg._id, 'eliminated')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              ev.status === 'eliminated' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            Eliminate
                          </button>
                          <button 
                            onClick={() => handleStatusChange(reg._id, 'winner')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                              ev.status === 'winner' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            Winner
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
