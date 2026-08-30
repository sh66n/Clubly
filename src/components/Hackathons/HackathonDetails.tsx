"use client";

import React, { useState } from "react";
import {
  Calendar,
  Clock,
  Info,
  Trophy,
  Users,
  Award,
  Download,
  MapPin,
  ExternalLink,
  MessageCircle,
  ChevronRight,
  ShieldCheck,
  Building,
  Share2,
  FileText,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import SubmissionUploader from "./SubmissionUploader";
import { toast } from "sonner";

interface HackathonDetailsProps {
  hackathon: any;
  rounds: any[];
  userTeam?: any;
  userRegistration?: any;
  userSubmissions?: any[];
  userId?: string;
}

export default function HackathonDetails({
  hackathon,
  rounds = [],
  userTeam,
  userRegistration,
  userSubmissions = [],
  userId,
}: HackathonDetailsProps) {
  const [copied, setCopied] = useState(false);

  const now = new Date();

  // Find first round date or created date
  const firstRound = rounds[0];
  const roundDate = firstRound?.submissionDeadline
    ? new Date(firstRound.submissionDeadline)
    : new Date(hackathon.createdAt || Date.now());

  const monthShort = format(roundDate, "MMM").toUpperCase();
  const dayNumber = format(roundDate, "d");
  const fullDateFormatted = format(roundDate, "EEEE, MMMM d");

  // Format team size
  const teamSizeText =
    hackathon.teamSizeRange?.min && hackathon.teamSizeRange?.max
      ? `${hackathon.teamSizeRange.min} - ${hackathon.teamSizeRange.max} Members`
      : `${hackathon.teamSize || 5} Members`;

  // Format prize
  const prizeFormatted =
    hackathon.prize && hackathon.prize > 0
      ? `₹${Number(hackathon.prize).toLocaleString("en-IN")}`
      : "Prizes in kind";

  // Active round for submissions
  const activeSubmissionRound =
    rounds.find((r) => r.requiresSubmission && r.status === "active") ||
    rounds.find((r) => r.requiresSubmission);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: hackathon.name,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 py-4 sm:py-6 max-w-6xl mx-auto px-1 sm:px-6">
      {/* Top Breadcrumb / Category Tag */}
      <div className="flex items-center justify-between mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-md border border-white/10 flex-wrap">
          <Sparkles size={14} className="text-amber-400" />
          <span>Hackathon Series</span>
          <span className="text-gray-400">•</span>
          <span className="text-gray-300">
            {[
              hackathon.organizingClub?.name,
              ...(hackathon.collaboratingClubs?.map((c: any) => c.name) || []),
            ]
              .filter(Boolean)
              .join(" × ")}
          </span>
        </div>

        <button
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition border border-white/10"
        >
          <Share2 size={13} />
          <span>{copied ? "Copied!" : "Share"}</span>
        </button>
      </div>

      {/* Main 2-Column Luma Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* ================= LEFT COLUMN: Visual Media & Host Info ================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          {/* Adaptive Event Poster Container */}
          <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black group">
            <img
              src={hackathon.image || "/images/default.png"}
              alt={hackathon.name}
              className="w-full h-auto max-h-[580px] object-contain block mx-auto group-hover:scale-[1.01] transition-transform duration-500"
            />
          </div>

          {/* Hosted By Clubs (Single Clean Grouping) */}
          <div className="space-y-3 pt-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Hosted By
            </p>
            <div className="space-y-2">
              {/* Primary Organizing Club */}
              {hackathon.organizingClub && (
                <div className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/10 relative shrink-0">
                      <img
                        src={hackathon.organizingClub?.logo || "/images/logo.png"}
                        alt={hackathon.organizingClub?.name || "Club"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">
                        {hackathon.organizingClub?.name || "College Club"}
                      </p>
                      {(hackathon.organizingClub?.fullName || hackathon.organizingClub?.department) && (
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                          {hackathon.organizingClub.fullName || hackathon.organizingClub.department}
                        </p>
                      )}
                    </div>
                  </div>

                  {hackathon.organizingClub?._id && (
                    <Link
                      href={`/clubs/${hackathon.organizingClub._id}`}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/10 shrink-0"
                    >
                      View Club
                    </Link>
                  )}
                </div>
              )}

              {/* Collaborating Clubs */}
              {hackathon.collaboratingClubs?.map((collabClub: any) => (
                <div
                  key={collabClub._id || collabClub}
                  className="flex items-center justify-between p-3 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-800 border border-white/10 relative shrink-0">
                      <img
                        src={collabClub.logo || "/images/logo.png"}
                        alt={collabClub.name || "Co-Host"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">
                        {collabClub.name}
                      </p>
                      {(collabClub.fullName || collabClub.department) && (
                        <p className="text-[11px] text-gray-400 mt-0.5 line-clamp-1">
                          {collabClub.fullName || collabClub.department}
                        </p>
                      )}
                    </div>
                  </div>

                  {collabClub._id && (
                    <Link
                      href={`/clubs/${collabClub._id}`}
                      className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition border border-white/10 shrink-0"
                    >
                      View Club
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Event Coordinators */}
          {hackathon.contact && hackathon.contact.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Event Coordinators
              </p>
              <div className="space-y-2">
                {hackathon.contact.map((c: any, i: number) => (
                  <div
                    key={c._id || i}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/5"
                  >
                    <img
                      src={c.image || "/images/default.png"}
                      className="w-8 h-8 rounded-full object-cover border border-white/10"
                      alt=""
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-white">{c.name}</p>
                      <p className="text-[11px] text-gray-400">{c.department || c.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* WhatsApp Community Button */}
          {hackathon.whatsappGroupLink && (
            <a
              href={hackathon.whatsappGroupLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-2 w-full p-3 rounded-2xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white border border-[#25D366]/20 font-bold text-xs transition duration-200"
            >
              <MessageCircle size={16} />
              <span>Join Official WhatsApp Community</span>
            </a>
          )}
        </div>

        {/* ================= RIGHT COLUMN: Header, Registration Card, Agenda & Details ================= */}
        <div className="lg:col-span-7 space-y-8">
          {/* Header Title */}
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
              {hackathon.name}
            </h1>
          </div>

          {/* Date & Location Pill Section (Luma Style) */}
          <div className="space-y-4">
            {/* Date Card */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex flex-col items-center justify-center text-center flex-shrink-0">
                <span className="text-[10px] font-bold text-red-400 uppercase leading-none">
                  {monthShort}
                </span>
                <span className="text-lg font-black text-white leading-tight mt-0.5">
                  {dayNumber}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{fullDateFormatted}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Registration & Submission Period: Sep 6 – Sep 13, 2026
                </p>
              </div>
            </div>

            {/* Location Card */}
            <div className="flex items-start gap-4 p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 backdrop-blur-sm">
              <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-blue-400 flex-shrink-0">
                <MapPin size={22} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Hybrid / On-Campus Presentation</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Vasantdada Patil Pratishthan’s College of Engineering, Sion, Mumbai
                </p>
              </div>
            </div>
          </div>

          {/* Registration / Team Card (Luma Card Style) */}
          <div className="rounded-3xl bg-white/[0.05] border border-white/15 p-6 shadow-xl space-y-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                  Registration
                </p>
                <h3 className="text-lg font-bold text-white mt-0.5">
                  {userRegistration
                    ? "Team Registration Confirmed"
                    : userTeam
                    ? "Team Ready for Registration"
                    : "Form a Team to Participate"}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Round 1 Free
                </span>
              </div>
            </div>

            {/* If user is not registered */}
            {!userTeam ? (
              <div className="space-y-4">
                <p className="text-xs text-gray-300 leading-relaxed">
                  Join with friends or create a team with up to {hackathon.teamSize || 5} members.
                  Submit your PPT presentation alongside registration.
                </p>
                <Link
                  href={`/hackathons/${hackathon._id}/teams`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-white text-slate-900 font-bold hover:bg-gray-100 transition shadow-lg text-sm"
                >
                  <span>Request / Register Team</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            ) : !userRegistration ? (
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-xs">
                  <p className="font-semibold text-white">Team: {userTeam.name}</p>
                  <p className="text-gray-400 mt-0.5">
                    {userTeam.members?.length || 1} / {userTeam.maxSize || 5} members joined.
                  </p>
                </div>
                <Link
                  href={`/hackathons/${hackathon._id}/teams`}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#7CB342] text-white font-bold hover:bg-[#689f38] transition shadow-lg text-sm"
                >
                  <span>Complete Team Registration</span>
                  <ChevronRight size={16} />
                </Link>
              </div>
            ) : (
              /* User is Registered: Direct Interactive Submission */
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                  <CheckCircle2 size={16} />
                  <span>Your team {userTeam.name} is successfully registered!</span>
                </div>

                {activeSubmissionRound && (
                  <div className="pt-2">
                    <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">
                      Active Stage: {activeSubmissionRound.name}
                    </p>
                    <SubmissionUploader
                      hackathonId={hackathon._id}
                      roundId={activeSubmissionRound._id}
                      teamId={userTeam._id}
                      templateUrl={hackathon.submissionConfig?.templateUrl}
                      allowedFormats={hackathon.submissionConfig?.allowedFormats}
                      maxFileSizeMB={hackathon.submissionConfig?.maxFileSizeMB}
                      existingSubmission={userSubmissions?.find(
                        (s: any) =>
                          (s.round?._id || s.round)?.toString() ===
                          activeSubmissionRound._id?.toString()
                      )}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* About Event Description */}
          {hackathon.description && (
            <div className="space-y-3 pt-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>About Hackathon</span>
              </h3>
              <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap font-normal">
                {hackathon.description}
              </div>
            </div>
          )}

          {/* Official PPT Template Banner */}
          {hackathon.submissionConfig?.templateUrl && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-[#7CB342]" />
                  Official Idea Presentation Template
                </p>
                <p className="text-xs text-gray-400">
                  Follow the official slide guidelines strictly for Round 1 evaluation.
                </p>
              </div>
              <a
                href={hackathon.submissionConfig.templateUrl}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#7CB342] text-white text-xs font-bold rounded-xl hover:bg-[#689f38] transition flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download size={14} /> Download Template
              </a>
            </div>
          )}

          {/* Agenda / Rounds Section (Luma Agenda List Style) */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">🗓️ Stages & Agenda</h3>
            </div>

            <div className="space-y-8 pl-1">
              {rounds.map((round: any, idx: number) => {
                const deadlineDate = round.submissionDeadline
                  ? new Date(round.submissionDeadline)
                  : null;

                return (
                  <div key={round._id || idx} className="space-y-2 border-l-2 border-white/10 pl-5 relative">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-[#7CB342]" />
                    
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-bold text-white">
                        {round.name}
                      </h4>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/10 text-gray-300">
                        {round.registrationFee > 0 ? `Fee: ₹${round.registrationFee}` : "Free Round"}
                      </span>
                    </div>

                    {deadlineDate && (
                      <p className="text-xs text-emerald-400 font-medium">
                        Submission Deadline: {format(deadlineDate, "dd MMM yyyy, hh:mm a")}
                      </p>
                    )}

                    {round.description && (
                      <p className="text-xs text-gray-400 leading-relaxed">
                        {round.description}
                      </p>
                    )}

                    {round.submissionInstructions && (
                      <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-gray-300">
                        <span className="font-semibold text-white">Guidelines: </span>
                        {round.submissionInstructions}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rewards & Prizes */}
          {hackathon.prize > 0 && (
            <div className="space-y-4 pt-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span>🏆 Rewards & Recognition</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <Trophy size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                      Cash Prize Pool
                    </p>
                    <p className="text-lg font-black text-white">{prizeFormatted}</p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Award size={24} />
                  </div>
                  <div>
                    <p className="text-xs uppercase text-gray-400 font-semibold tracking-wider">
                      Certificates
                    </p>
                    <p className="text-sm font-bold text-white">Winner & Participation</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location Map Section */}
          <div className="space-y-3 pt-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin size={18} className="text-rose-400" />
              <span>Location</span>
            </h3>

            <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-white/10">
              <iframe
                title="Hackathon Location"
                src="https://maps.google.com/maps?q=19.05061303028157,72.87836472698159&hl=en&z=16&output=embed"
                width="100%"
                height="260"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
