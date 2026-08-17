'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Folder,
  Plus,
  Grid,
  List as ListIcon,
  Layers,
  ChevronRight,
} from 'lucide-react';
import GenerateEventFolderModal from './GenerateEventFolderModal';

interface CertificateFolderClientProps {
  folders: any[];
  certificates: any[];
  eventOptions: any[];
  folderStats: Record<string, { total: number; published: number; draft: number }>;
  totalFoldersCount: number;
  totalCertificatesCount: number;
  totalPublishedCount: number;
  totalDraftCount: number;
}

export default function CertificateFolderClient({
  folders,
  certificates,
  eventOptions,
  folderStats,
  totalFoldersCount,
  totalCertificatesCount,
  totalPublishedCount,
  totalDraftCount,
}: CertificateFolderClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Compute unassigned stats
  const unassignedStats = folderStats.unassigned || { total: 0, published: 0, draft: 0 };

  // Filter Event Folders
  const filteredFolders = folders.filter((folder) => {
    const displayName = folder.name ? folder.name.replace(/^Event:\s*/i, "") : "Untitled";
    const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const stats = folderStats[folder._id.toString()] || { total: 0, published: 0, draft: 0 };
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'published' && stats.published > 0) ||
      (statusFilter === 'draft' && stats.draft > 0);

    return matchesSearch && matchesStatus;
  });

  // Check if unassigned matches search
  const showUnassigned =
    unassignedStats.total > 0 &&
    "unassigned templates".includes(searchQuery.toLowerCase()) &&
    (statusFilter === 'all' ||
      (statusFilter === 'published' && unassignedStats.published > 0) ||
      (statusFilter === 'draft' && unassignedStats.draft > 0));

  return (
    <div className="p-6 max-w-7xl mx-auto w-full space-y-6">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mb-1">
            Certificate Folders
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Organize and manage event certificate templates inside structured drive folders.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <GenerateEventFolderModal events={eventOptions} />
          <Link
            href="/club-admin/certificates/new"
            className="px-4 py-2 text-sm font-semibold text-white bg-[#7CB342] border border-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap active:scale-95"
          >
            <Plus className="w-4 h-4" /> New Certificate
          </Link>
        </div>
      </div>

      {/* Dark Radial Gradient Stats Banner Box */}
      <div
        className="border border-[#2d5c0c] text-white rounded-2xl shadow-md relative overflow-hidden"
        style={{
          background: "radial-gradient(ellipse 1250px 100px at bottom right, #254f0a 0%, #040c00 100%)",
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.95] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' result='noise'/%3E%3CfeColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1.5 -0.2'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='3.2' intercept='-1.0'/%3E%3CfeFuncG type='linear' slope='3.2' intercept='-1.0'/%3E%3CfeFuncB type='linear' slope='3.2' intercept='-1.0'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />

        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#224b0a]">
          <div className="flex flex-col p-6">
            <span className="text-sm font-semibold text-[#9ccc65] mb-4">Event Folders</span>
            <span className="text-4xl font-bold text-white tracking-tight mt-auto">{totalFoldersCount}</span>
          </div>

          <div className="flex flex-col p-6">
            <span className="text-sm font-semibold text-[#9ccc65] mb-4">Total Templates</span>
            <span className="text-4xl font-bold text-white tracking-tight mt-auto">{totalCertificatesCount}</span>
          </div>

          <div className="flex flex-col p-6">
            <span className="text-sm font-semibold text-[#9ccc65] mb-4">Published</span>
            <span className="text-4xl font-bold text-white tracking-tight mt-auto">{totalPublishedCount}</span>
          </div>

          <div className="flex flex-col p-6">
            <span className="text-sm font-semibold text-[#9ccc65] mb-4">Drafts</span>
            <span className="text-4xl font-bold text-white tracking-tight mt-auto">{totalDraftCount}</span>
          </div>
        </div>
      </div>

      {/* Spotify Library-style Filter Pill Toolbar Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'all'
                ? "bg-[#7CB342] text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            All Folders
          </button>
          <button
            onClick={() => setStatusFilter('published')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'published'
                ? "bg-[#7CB342] text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setStatusFilter('draft')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all shrink-0 ${
              statusFilter === 'draft'
                ? "bg-[#7CB342] text-white shadow-sm"
                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
            }`}
          >
            Drafts
          </button>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in Library..."
              className="pl-8 pr-3 py-1.5 bg-slate-100 focus:bg-white border border-transparent focus:border-[#7CB342] rounded-full text-xs font-medium text-slate-800 placeholder-slate-400 transition-all outline-none w-44 sm:w-56"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-full border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-full text-xs transition-all ${
                viewMode === 'grid'
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1 rounded-full text-xs transition-all ${
                viewMode === 'list'
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {filteredFolders.length === 0 && !showUnassigned ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white border border-slate-200/80 rounded-2xl text-center shadow-sm">
          <Folder className="w-12 h-12 text-slate-300 stroke-[1.5] mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No folders found</h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mb-5 leading-relaxed">
            {searchQuery || statusFilter !== 'all'
              ? "Try adjusting your search query or status filter."
              : "Generate an event folder to automatically create participant and winner certificate slots."}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#7CB342]" /> Folders ({filteredFolders.length + (showUnassigned ? 1 : 0)})
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {filteredFolders.map((folder: any) => {
              const folderIdStr = folder._id.toString();
              const stats = folderStats[folderIdStr] || { total: 0, published: 0, draft: 0 };
              const displayName = folder.name ? folder.name.replace(/^Event:\s*/i, "") : "Untitled";
              const coverImage = folder.event?.image;

              return (
                <Link
                  key={folderIdStr}
                  href={`/club-admin/certificates/folder/${folderIdStr}`}
                  className="group bg-slate-50/60 hover:bg-slate-100/80 p-3.5 rounded-2xl transition-all duration-200 border border-slate-200/50 flex flex-col justify-between"
                >
                  <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#f0f7e6] border border-[#c5d6a8]/60 mb-3 shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center">
                    {coverImage ? (
                      <img
                        src={coverImage}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#f0f7e6] to-[#e1f0cc] text-[#7CB342]">
                        <Folder className="w-10 h-10 fill-[#7CB342]/20 stroke-[1.75] group-hover:scale-110 transition-transform duration-300" />
                      </div>
                    )}

                    <div className="absolute top-2 right-2">
                      <span className="w-6 h-6 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-[#7CB342] flex items-center justify-center shadow-md text-[10px] font-extrabold">
                        {stats.total}
                      </span>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <h3
                      className="font-bold text-slate-800 text-sm group-hover:text-[#7CB342] transition-colors truncate"
                      title={displayName}
                    >
                      {displayName}
                    </h3>
                    <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                      <span className="text-[#7CB342] font-bold">📌 Folder</span>
                      <span className="text-slate-300">•</span>
                      <span>{stats.total} {stats.total === 1 ? "template" : "templates"}</span>
                    </p>
                  </div>
                </Link>
              );
            })}

            {showUnassigned && (
              <Link
                href="/club-admin/certificates/folder/unassigned"
                className="group bg-slate-50/60 hover:bg-slate-100/80 p-3.5 rounded-2xl transition-all duration-200 border border-slate-200/50 flex flex-col justify-between"
              >
                <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3 shadow-sm group-hover:shadow-md transition-shadow flex items-center justify-center">
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500">
                    <Folder className="w-10 h-10 fill-slate-200 stroke-[1.75] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <div className="absolute top-2 right-2">
                    <span className="w-6 h-6 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/20 text-slate-300 flex items-center justify-center shadow-md text-[10px] font-extrabold">
                      {unassignedStats.total}
                    </span>
                  </div>
                </div>

                <div className="min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#7CB342] transition-colors truncate">
                    Unassigned
                  </h3>
                  <p className="text-xs font-semibold text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                    <span className="text-slate-400 font-bold">📌 Standalone</span>
                    <span className="text-slate-300">•</span>
                    <span>{unassignedStats.total} {unassignedStats.total === 1 ? "template" : "templates"}</span>
                  </p>
                </div>
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {filteredFolders.map((folder: any) => {
              const folderIdStr = folder._id.toString();
              const stats = folderStats[folderIdStr] || { total: 0, published: 0, draft: 0 };
              const eventDate = folder.event?.date ? new Date(folder.event.date) : null;
              const displayName = folder.name ? folder.name.replace(/^Event:\s*/i, "") : "Untitled";

              return (
                <Link
                  key={folderIdStr}
                  href={`/club-admin/certificates/folder/${folderIdStr}`}
                  className="flex items-center justify-between p-4 hover:bg-[#f0f7e6]/40 transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#f0f7e6] text-[#7CB342] border border-[#c5d6a8] flex items-center justify-center shrink-0">
                      <Folder className="w-5 h-5 fill-[#7CB342]/20" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#7CB342] transition-colors truncate">
                        {displayName}
                      </h3>
                      {eventDate && (
                        <p className="text-xs text-slate-400">
                          {eventDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs">
                    <span className="text-slate-555 font-semibold">
                      {stats.total} {stats.total === 1 ? "template" : "templates"}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              );
            })}

            {showUnassigned && (
              <Link
                href="/club-admin/certificates/folder/unassigned"
                className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center shrink-0">
                    <Folder className="w-5 h-5 fill-slate-200" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm group-hover:text-[#7CB342] transition-colors">
                      Unassigned Templates
                    </h3>
                    <p className="text-xs text-slate-400">Standalone templates</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs">
                  <span className="text-slate-500 font-semibold">
                    {unassignedStats.total} {unassignedStats.total === 1 ? "template" : "templates"}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
