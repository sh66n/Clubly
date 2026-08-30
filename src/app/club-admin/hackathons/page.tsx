"use client";
import React, { useState, useEffect } from "react";
import { Plus, Search, Calendar, Users, FileText, CheckCircle2, Pencil, ExternalLink } from "lucide-react";
import Link from "next/link";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import { format } from "date-fns";

export default function ClubAdminHackathonsPage() {
  const [data, setData] = useState<{ hackathons: any[], metrics: any } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/club-admin/hackathons")
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ClublyLoader />
      </div>
    );
  }

  const hackathons = data?.hackathons || [];
  const metrics = data?.metrics || {};

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Hackathons</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your club's hackathons, rounds, and submissions.</p>
        </div>
        <Link 
          href="/club-admin/hackathons/new"
          className="flex items-center gap-2 bg-[#7CB342] text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#689f38] transition"
        >
          <Plus size={18} /> Create Hackathon
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Hackathons</p>
            <p className="text-2xl font-bold text-slate-800">{metrics.totalHackathons || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Total Teams</p>
            <p className="text-2xl font-bold text-slate-800">{metrics.totalTeams || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-lg"><FileText size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Submissions</p>
            <p className="text-2xl font-bold text-slate-800">{metrics.totalSubmissions || 0}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><CheckCircle2 size={24} /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Live Hackathons</p>
            <p className="text-2xl font-bold text-slate-800">{metrics.live || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {hackathons.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Calendar size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-700 mb-1">No Hackathons yet</h3>
            <p className="text-sm text-slate-500 mb-4">Create your first hackathon to start accepting team registrations.</p>
            <Link 
              href="/club-admin/hackathons/new"
              className="inline-flex items-center gap-2 bg-[#7CB342] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#689f38] transition"
            >
              <Plus size={16} /> Create Hackathon
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4">Hackathon</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Teams</th>
                  <th className="p-4">Submissions</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hackathons.map(h => (
                  <tr key={h._id} className="hover:bg-slate-50/50 transition group">
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{h.name}</p>
                      <p className="text-xs text-slate-500 mt-1 truncate max-w-xs">{h.description || 'No description'}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                        h.status === 'live' ? 'bg-emerald-100 text-emerald-700' :
                        h.status === 'draft' ? 'bg-slate-100 text-slate-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{h.teamsCount}</td>
                    <td className="p-4 font-medium text-slate-700">{h.submissionsCount}</td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link 
                          href={`/hackathons/${h._id}`}
                          target="_blank"
                          className="text-slate-400 hover:text-slate-600 transition"
                          title="View Live Page"
                        >
                          <ExternalLink size={16} />
                        </Link>
                        <Link 
                          href={`/club-admin/hackathons/${h._id}`}
                          className="flex items-center gap-1 text-[#7CB342] font-semibold text-sm hover:underline"
                        >
                          <Pencil size={14} /> Edit & Manage
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
