"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { UserCertificateItem } from "@/services/getUserCertificates";
import { Award, ExternalLink, Download, Calendar } from "lucide-react";

interface ProfileCertificatesTabProps {
  certificates: UserCertificateItem[];
}

export default function ProfileCertificatesTab({ certificates }: ProfileCertificatesTabProps) {
  if (certificates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-white/10 bg-slate-900/30">
        <Award className="w-12 h-12 text-slate-500 mb-3" />
        <h3 className="text-lg font-bold text-white mb-1">No Certificates Earned Yet</h3>
        <p className="text-sm text-slate-400 max-w-sm">
          Participate in club hackathons, workshops, and tournaments to earn verified certificates of participation and excellence!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Verified Credentials & Certificates</h2>
          <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
            {certificates.length} Total
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {certificates.map((cert) => (
          <div
            key={cert.eventId}
            className="flex flex-col justify-between p-5 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-black/40 hover:border-emerald-500/40 transition-all group"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {cert.clubLogo ? (
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/15 bg-black shrink-0">
                      <Image
                        src={cert.clubLogo}
                        alt={cert.clubName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                      {cert.eventName}
                    </h3>
                    <p className="text-xs text-slate-400">{cert.clubName}</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md ${
                    cert.position === 1
                      ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      : cert.position > 1
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  }`}
                >
                  {cert.rankValue}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Issued on {cert.issueDate}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 mt-4 border-t border-white/5">
              <Link
                href={cert.publicUrl}
                target="_blank"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Certificate</span>
              </Link>
              <Link
                href={cert.downloadUrl}
                target="_blank"
                className="flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-white/10 transition-colors"
                title="Download PDF"
              >
                <Download className="w-4 h-4" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
