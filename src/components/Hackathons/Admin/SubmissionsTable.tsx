"use client";
import React, { useState, useEffect } from "react";
import { Download, Eye, FileText, Search, AlertCircle } from "lucide-react";
import { format } from "date-fns";

export default function SubmissionsTable({ hackathonId, rounds }: { hackathonId: string, rounds: any[] }) {
  const [selectedRound, setSelectedRound] = useState<string>(rounds[0]?._id || "");
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [previewSub, setPreviewSub] = useState<any | null>(null);

  useEffect(() => {
    if (!selectedRound) return;
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/hackathons/${hackathonId}/rounds/${selectedRound}/submissions`);
        if (res.ok) {
          const data = await res.json();
          setSubmissions(Array.isArray(data) ? data : data.submissions || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [selectedRound, hackathonId]);

  const filtered = submissions.filter(s => 
    s.team?.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.submittedBy?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const getPreviewUrl = (url: string, fileName: string) => {
    // Cloudinary raw URLs force attachment downloads unless viewed via Google Docs Viewer or Office Web Viewer
    const cleanUrl = url.replace("/upload/", "/upload/fl_attachment:false/");
    return `https://docs.google.com/viewer?url=${encodeURIComponent(cleanUrl)}&embedded=true`;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-700">Select Round:</label>
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
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search teams..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-1.5 border border-slate-300 rounded-lg text-sm outline-none focus:border-[#7CB342] w-full sm:w-64 text-slate-900 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 text-sm">Loading submissions...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center justify-center text-slate-500">
            <FileText size={48} className="text-slate-300 mb-4" />
            <p className="text-lg font-medium text-slate-700">No submissions found</p>
            <p className="text-sm">Wait for teams to submit their work for this round.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Team</th>
                  <th className="p-4">Submitted By</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">File</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(sub => (
                  <tr key={sub._id} className="hover:bg-slate-50/50 transition">
                    <td className="p-4">
                      <p className="font-semibold text-slate-800">{sub.team?.name}</p>
                      <p className="text-xs text-slate-500">{sub.team?.members?.length || 0} members</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-700">{sub.submittedBy?.name}</p>
                      <p className="text-xs text-slate-500">{sub.submittedBy?.email}</p>
                    </td>
                    <td className="p-4 text-sm text-slate-600">
                      {format(new Date(sub.submittedAt), "MMM d, HH:mm")}
                      <span className="ml-2 text-xs bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">v{sub.version}</span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => setPreviewSub(sub)}
                        className="flex items-center gap-2 text-left hover:opacity-80 transition group"
                      >
                        <FileText size={16} className="text-[#7CB342] shrink-0" />
                        <div className="truncate max-w-[170px]">
                          <span className="text-sm font-semibold text-slate-800 group-hover:text-[#7CB342] group-hover:underline truncate block" title={sub.fileName}>
                            {sub.fileName}
                          </span>
                          <span className="text-xs text-slate-400">({(sub.fileSizeBytes / 1024 / 1024).toFixed(2)} MB)</span>
                        </div>
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setPreviewSub(sub)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#f0f7e6] text-[#7CB342] hover:bg-[#e2f1cd] rounded-lg text-xs font-bold transition border border-[#c5d6a8]"
                          title="Preview File"
                        >
                          <Eye size={14} /> Preview
                        </button>
                        <a 
                          href={sub.fileUrl} 
                          download={sub.fileName}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition border border-slate-200" 
                          title="Download"
                        >
                          <Download size={14} />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* In-Page File Preview Modal */}
      {previewSub && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#f0f7e6] text-[#7CB342] flex items-center justify-center shrink-0 border border-[#c5d6a8]">
                  <FileText size={16} />
                </div>
                <div className="truncate">
                  <h3 className="text-sm font-bold text-slate-800 truncate">
                    {previewSub.fileName}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    Team: <span className="font-semibold text-slate-600">{previewSub.team?.name}</span> • Submitted by {previewSub.submittedBy?.name}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewSub.fileUrl}
                  download={previewSub.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
                >
                  <Download size={13} /> Download
                </a>
                <button
                  onClick={() => setPreviewSub(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body / Viewer */}
            <div className="flex-1 bg-slate-900 w-full h-full relative">
              <iframe
                src={getPreviewUrl(previewSub.fileUrl, previewSub.fileName)}
                className="w-full h-full border-0"
                title={previewSub.fileName}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
