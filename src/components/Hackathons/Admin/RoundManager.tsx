"use client";
import React, { useState } from "react";
import { Plus, Edit2, Check, X, Calendar, Clock, Edit } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export default function RoundManager({ hackathonId, rounds, fetchDetails }: { hackathonId: string, rounds: any[], fetchDetails: () => void }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("upcoming");
  const [registrationFee, setRegistrationFee] = useState(0);
  const [submissionDeadline, setSubmissionDeadline] = useState("");
  const [resultDate, setResultDate] = useState("");
  const [requiresSubmission, setRequiresSubmission] = useState(false);
  const [submissionInstructions, setSubmissionInstructions] = useState("");

  const resetForm = () => {
    setName("");
    setDescription("");
    setStatus("upcoming");
    setRegistrationFee(0);
    setSubmissionDeadline("");
    setResultDate("");
    setRequiresSubmission(false);
    setSubmissionInstructions("");
    setIsAdding(false);
    setEditingId(null);
  };

  const formatForInput = (dateStr?: string | Date) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const pad = (n: number) => n.toString().padStart(2, "0");
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleEdit = (round: any) => {
    setEditingId(round._id);
    setName(round.name);
    setDescription(round.description || "");
    setStatus(round.status);
    setRegistrationFee(round.registrationFee || 0);
    setSubmissionDeadline(formatForInput(round.submissionDeadline));
    setResultDate(formatForInput(round.resultDate));
    setRequiresSubmission(round.requiresSubmission);
    setSubmissionInstructions(round.submissionInstructions || "");
  };

  const handleSave = async () => {
    try {
      const payload = {
        name,
        description,
        status,
        registrationFee,
        submissionDeadline: submissionDeadline ? new Date(submissionDeadline).toISOString() : null,
        resultDate: resultDate ? new Date(resultDate).toISOString() : null,
        requiresSubmission,
        submissionInstructions,
      };

      const url = editingId 
        ? `/api/hackathons/${hackathonId}/rounds/${editingId}`
        : `/api/hackathons/${hackathonId}/rounds`;
      
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save round");
      }

      toast.success(editingId ? "Round updated" : "Round created");
      resetForm();
      fetchDetails();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Round Management</h2>
        <button
          onClick={() => { resetForm(); setIsAdding(true); }}
          className="flex items-center gap-2 bg-[#7CB342] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#689f38] transition"
        >
          <Plus size={16} /> Add Round
        </button>
      </div>

      <div className="space-y-4">
        {rounds.map((round, idx) => (
          <div key={round._id} className="border border-slate-200 rounded-xl p-5 bg-white shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-bold">Round {round.roundNumber}</span>
                  <h3 className="text-lg font-bold text-slate-800">{round.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                    round.status === 'upcoming' ? 'bg-amber-100 text-amber-700' :
                    round.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    round.status === 'evaluating' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {round.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-4">{round.description || "No description provided."}</p>
                
                <div className="flex items-center gap-6 text-sm text-slate-600">
                  {round.submissionDeadline && (
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-slate-400"/>
                      <span>Deadline: {format(new Date(round.submissionDeadline), "MMM d, yyyy HH:mm")}</span>
                    </div>
                  )}
                  {round.resultDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-slate-400"/>
                      <span>Result: {format(new Date(round.resultDate), "MMM d, yyyy")}</span>
                    </div>
                  )}
                  {round.requiresSubmission && (
                    <div className="flex items-center gap-2 font-medium text-[#7CB342]">
                      <Check size={14} /> Requires Submission
                    </div>
                  )}
                </div>
              </div>
              <button onClick={() => handleEdit(round)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition">
                <Edit size={16} />
              </button>
            </div>
          </div>
        ))}

        {rounds.length === 0 && !isAdding && (
          <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-500">
            No rounds found. Create the first round to get started.
          </div>
        )}
      </div>

      {/* Editor Modal */}
      {(isAdding || editingId) && (
        <div className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Round' : 'Add New Round'}</h3>
              <button onClick={resetForm} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Round Name</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#7CB342] text-slate-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Status</label>
                  <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#7CB342] text-slate-900 bg-white">
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="evaluating">Evaluating</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#7CB342] text-slate-900 bg-white" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Submission Deadline</label>
                  <input type="datetime-local" value={submissionDeadline} onChange={e => setSubmissionDeadline(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#7CB342] text-slate-900 bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Result Date</label>
                  <input type="datetime-local" value={resultDate} onChange={e => setResultDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#7CB342] text-slate-900 bg-white" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="reqSub" checked={requiresSubmission} onChange={e => setRequiresSubmission(e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-[#7CB342] focus:ring-[#7CB342]"/>
                <label htmlFor="reqSub" className="text-sm font-semibold text-slate-700">Requires File Submission</label>
              </div>

              {requiresSubmission && (
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Submission Instructions</label>
                  <textarea value={submissionInstructions} onChange={e => setSubmissionInstructions(e.target.value)} rows={3} placeholder="Format guidelines, presentation limits..." className="w-full px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-[#7CB342] text-slate-900 bg-white" />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
                <button onClick={resetForm} className="px-4 py-2 font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition">Cancel</button>
                <button onClick={handleSave} className="px-4 py-2 font-semibold text-white bg-[#7CB342] hover:bg-[#689f38] rounded-lg transition">Save Round</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
