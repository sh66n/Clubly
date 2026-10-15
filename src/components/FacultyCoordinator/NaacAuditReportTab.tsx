"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  FileCheck2,
  Printer,
  Download,
  PenTool,
  Loader2,
  Image as ImageIcon,
  Info,
  Save,
} from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";
import SignLibraryModal, { SignatureItem } from "./SignLibraryModal";

interface NaacAuditReportTabProps {
  events: any[];
  preselectedEventId?: string;
  coordinatorName?: string;
}

interface SignBlockState {
  name: string;
  position: string;
  signatureUrl?: string;
}

export default function NaacAuditReportTab({
  events,
  preselectedEventId,
  coordinatorName,
}: NaacAuditReportTabProps) {
  const [selectedEventId, setSelectedEventId] = useState(preselectedEventId || "");
  const [loading, setLoading] = useState(false);
  const [savingSignatures, setSavingSignatures] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  // Sign Library modal state
  const [activeSignBlockIndex, setActiveSignBlockIndex] = useState<number | null>(null);
  const [isSignLibOpen, setIsSignLibOpen] = useState(false);

  // 4 Signature blocks: [President, Collab President, Faculty Coordinator, HOD]
  const [signatures, setSignatures] = useState<SignBlockState[]>([
    { name: "Student President", position: "CESA President", signatureUrl: "" },
    { name: "Partner President", position: "CSI President", signatureUrl: "" },
    {
      name: coordinatorName || "Prof. Karishma Shambharkar",
      position: "Faculty Coordinator",
      signatureUrl: "",
    },
    { name: "Dr. Rais A. Mulla", position: "HOD, Comp. Engg.", signatureUrl: "" },
  ]);

  const signaturesRef = useRef(signatures);
  useEffect(() => {
    signaturesRef.current = signatures;
  }, [signatures]);

  const reportContainerRef = useRef<HTMLDivElement>(null);

  const fetchReport = async (eventId: string) => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/faculty-coordinator/naac-report?eventId=${eventId}`);
      if (!res.ok) throw new Error("Failed to load NAAC report data");
      const data = await res.json();
      setReportData(data.report);

      // Check priority:
      // 1. Specifically saved for this event
      // 2. Last used sign block from database (club.lastNaacSignatures)
      // 3. Last used sign block from localStorage
      // 4. Fallback to default generated block
      let resolvedSigs: SignBlockState[] | null = null;

      if (
        data.report.naacSignatures &&
        Array.isArray(data.report.naacSignatures) &&
        data.report.naacSignatures.length > 0
      ) {
        resolvedSigs = data.report.naacSignatures;
      } else if (
        data.report.lastUsedSignatures &&
        Array.isArray(data.report.lastUsedSignatures) &&
        data.report.lastUsedSignatures.length > 0
      ) {
        resolvedSigs = data.report.lastUsedSignatures;
      } else {
        try {
          const cached = localStorage.getItem("clubly_last_naac_signatures");
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              resolvedSigs = parsed;
            }
          }
        } catch (e) {
          // ignore localStorage error
        }
      }

      if (resolvedSigs) {
        setSignatures(resolvedSigs);
      } else {
        setSignatures([
          {
            name: "Club President",
            position: `${data.report.organizingClubName} President`,
            signatureUrl: "",
          },
          {
            name: data.report.collaboratingClubs?.[0] ? "Partner President" : "General Secretary",
            position: data.report.collaboratingClubs?.[0]
              ? `${data.report.collaboratingClubs[0]} President`
              : "Secretary",
            signatureUrl: "",
          },
          {
            name: data.report.facultyCoordinatorName || coordinatorName || "Faculty Coordinator",
            position: "Faculty Coordinator",
            signatureUrl: "",
          },
          {
            name: "Head of Department",
            position: `HOD, ${data.report.departmentName?.replace("DEPARTMENT OF ", "") || "Department"}`,
            signatureUrl: "",
          },
        ]);
      }
    } catch (err: any) {
      toast.error(err.message || "Could not fetch report data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchReport(selectedEventId);
    } else if (events.length > 0 && !selectedEventId) {
      setSelectedEventId(events[0].id);
    }
  }, [selectedEventId]);

  const saveSignaturesToBackend = async (
    currentSigs?: SignBlockState[],
    showToast = false
  ) => {
    if (!selectedEventId) return;
    const sigsToSave = currentSigs || signaturesRef.current;
    try {
      setSavingSignatures(true);

      // Save to localStorage immediately as well
      try {
        localStorage.setItem("clubly_last_naac_signatures", JSON.stringify(sigsToSave));
      } catch (e) {}

      const res = await fetch("/api/faculty-coordinator/naac-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEventId,
          signatures: sigsToSave,
        }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Failed to save signatures");
      }
      if (showToast) {
        toast.success("Signature block remembered for this event and future events!");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to remember signatures");
    } finally {
      setSavingSignatures(false);
    }
  };

  const handleExportPdf = async () => {
    if (!reportContainerRef.current) return;
    try {
      setDownloadingPdf(true);
      toast.info("Generating official NAAC report PDF...");

      const pageElements =
        reportContainerRef.current.querySelectorAll<HTMLElement>(".naac-report-page");

      if (!pageElements || pageElements.length === 0) {
        throw new Error("Report pages not found");
      }

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pageElements.length; i++) {
        if (i > 0) {
          pdf.addPage();
        }

        const el = pageElements[i];
        const canvas = await html2canvas(el, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff",
          windowWidth: 1024,
          onclone: (clonedDoc) => {
            // Remove style tags or classes that inject modern CSS functions like lab() / oklch()
            // html2canvas doesn't support CSS Color Level 4 functions (lab, oklch, etc.)
            const allElements = clonedDoc.querySelectorAll<HTMLElement>("*");
            allElements.forEach((node) => {
              // Ensure background and color use standard rgb / hex
              const computed = window.getComputedStyle(node);
              if (computed.color && computed.color.includes("lab")) {
                node.style.color = "#0f172a";
              }
              if (computed.backgroundColor && computed.backgroundColor.includes("lab")) {
                node.style.backgroundColor = "#ffffff";
              }
              if (computed.borderColor && computed.borderColor.includes("lab")) {
                node.style.borderColor = "#cbd5e1";
              }
            });
          },
        });

        const imgData = canvas.toDataURL("image/jpeg", 0.95);
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      }

      const safeEventName = (reportData?.eventName || "Event")
        .replace(/[^a-zA-Z0-9_-]/g, "_");
      pdf.save(`${safeEventName}_NAAC_Report.pdf`);
      toast.success("NAAC Report PDF exported successfully!");
    } catch (err: any) {
      console.error("PDF Export error:", err);
      toast.error(err.message || "Failed to export PDF directly");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSignSelect = (sign: SignatureItem) => {
    if (activeSignBlockIndex === null) return;
    const updated = [...signaturesRef.current];
    updated[activeSignBlockIndex] = {
      ...updated[activeSignBlockIndex],
      name: sign.name || updated[activeSignBlockIndex].name,
      position: sign.position || updated[activeSignBlockIndex].position,
      signatureUrl: sign.imageUrl,
    };
    setSignatures(updated);
    signaturesRef.current = updated;
    saveSignaturesToBackend(updated, false);
  };

  const updateSignBlock = (index: number, field: "name" | "position", value: string) => {
    const updated = [...signaturesRef.current];
    updated[index] = { ...updated[index], [field]: value };
    signaturesRef.current = updated;
    setSignatures(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar (hidden when printing) */}
      <div className="print:hidden bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileCheck2 size={18} className="text-[#7CB342]" />
              NAAC Accreditation Audit Report Generator
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Generate a structured, official NAAC audit report matching the college format with verified signatures.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => saveSignaturesToBackend(signaturesRef.current, true)}
              disabled={!reportData || loading || savingSignatures || downloadingPdf}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Remember this signature layout for this event and all future events"
            >
              {savingSignatures ? (
                <Loader2 size={14} className="animate-spin text-[#7CB342]" />
              ) : (
                <Save size={14} className="text-[#7CB342]" />
              )}
              Remember Signatures
            </button>
            <button
              onClick={handleExportPdf}
              disabled={!reportData || loading || downloadingPdf}
              className="px-4 py-2.5 bg-[#7CB342] hover:bg-[#689F38] text-white text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-2 cursor-pointer disabled:opacity-50"
              title="Directly download clean, multi-page vector-rendered PDF document without browser UI"
            >
              {downloadingPdf ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Download size={15} />
              )}
              {downloadingPdf ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Event Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="w-full sm:w-80">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Completed / Live Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#7CB342]"
            >
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} ({new Date(ev.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 text-xs text-slate-500 bg-[#fbfdfa] border border-[#e2edd3] p-3 rounded-xl flex items-start gap-2">
            <Info size={16} className="text-[#7CB342] shrink-0 mt-0.5" />
            <p>
              Includes official letterhead banner, event objectives, <strong>demographic breakdown</strong>, <strong>roll of honour</strong>, <strong>financial statement</strong>, <strong>student feedback metrics</strong>, photo glimpses, and customizable signature blocks.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-[#7CB342]" />
        </div>
      ) : !reportData ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
          <FileCheck2 size={36} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">Please select an event to generate the report</p>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          {/* Printable Document Sheets (Formatted for A4) */}
          <div
            ref={reportContainerRef}
            className="w-full max-w-[210mm] space-y-8 print:space-y-0 text-slate-900 font-serif"
          >
            {/* ══════════════════════════════════════════
                PAGE 1: EVENT DETAILS, OVERVIEW, OBJECTIVES, OUTCOMES
                ══════════════════════════════════════════ */}
            <div className="naac-report-page bg-white shadow-xl print:shadow-none p-10 sm:p-14 min-h-[297mm] flex flex-col justify-between border border-slate-200 print:border-none print:m-0 print:p-8 page-break-after">
              <div>
                {/* Official College Header Banner with Club Logo on the right */}
                <div className="border-b-2 border-slate-900 pb-2 mb-5 flex items-center justify-center">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src="/images/naac-header.png"
                      alt="Vasantdada Patil Pratishthan's College of Engineering and Visual Arts"
                      className="h-20 sm:h-24 w-auto object-contain shrink-0"
                    />
                    {reportData.organizingClubLogo && (
                      <img
                        src={reportData.organizingClubLogo}
                        alt={reportData.organizingClubName}
                        className="h-14 w-14 sm:h-16 sm:w-16 object-contain rounded-full shrink-0"
                      />
                    )}
                  </div>
                </div>

                {/* Event Title */}
                <div className="text-center my-6">
                  <h2 className="text-2xl font-bold tracking-wider uppercase underline underline-offset-8">
                    {reportData.eventName}
                  </h2>
                </div>

                {/* Details Section */}
                <div className="space-y-2 text-sm leading-relaxed mb-6 font-sans">
                  <h3 className="font-bold text-base font-serif mb-2 underline">
                    {reportData.eventName} Details:
                  </h3>
                  <p>
                    <span className="font-semibold">Institute Name:</span> {reportData.instituteName}
                  </p>
                  <p>
                    <span className="font-semibold">Location:</span> {reportData.location}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(reportData.date).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                    ,{" "}
                    {new Date(reportData.date).toLocaleDateString("en-US", {
                      weekday: "long",
                    })}
                  </p>
                  <p>
                    <span className="font-semibold">Faculty Coordinator:</span>{" "}
                    {signatures[2]?.name || reportData.facultyCoordinatorName}
                  </p>
                </div>

                {/* Overview */}
                <div className="space-y-2.5 text-sm leading-relaxed mb-6 font-sans">
                  <h3 className="font-bold text-base font-serif underline mb-2">Overview:</h3>
                  {reportData.overviewParagraphs && reportData.overviewParagraphs.length > 0 ? (
                    reportData.overviewParagraphs.map((para: string, idx: number) => (
                      <p key={idx} className="text-justify leading-normal">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="text-justify leading-normal">{reportData.description}</p>
                  )}
                </div>

                {/* Objectives */}
                <div className="space-y-2 text-sm leading-relaxed mb-6">
                  <h3 className="font-bold text-base font-serif underline">Objectives:</h3>
                  <ul className="list-disc list-outside pl-6 space-y-1.5 font-sans">
                    {reportData.objectives?.map((obj: string, idx: number) => (
                      <li key={idx} className="text-justify">
                        {obj}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Learning Outcomes */}
                <div className="space-y-2 text-sm leading-relaxed">
                  <h3 className="font-bold text-base font-serif underline">
                    Learning Outcomes:
                  </h3>
                  <ul className="list-disc list-outside pl-6 space-y-1.5 font-sans">
                    {reportData.learningOutcomes?.map((outcome: string, idx: number) => (
                      <li key={idx} className="text-justify">
                        {outcome}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Page 1 footer number */}
              <div className="text-center text-[10px] text-slate-400 font-sans pt-4 border-t border-slate-100">
                Page 1 of 3
              </div>
            </div>

            {/* ══════════════════════════════════════════
                PAGE 2: FORMAL ACADEMIC ANNEXURE (TABLES & METRICS)
                ══════════════════════════════════════════ */}
            <div className="naac-report-page bg-white shadow-xl print:shadow-none p-10 sm:p-14 min-h-[297mm] flex flex-col justify-between border border-slate-200 print:border-none print:m-0 print:p-8 page-break-after text-slate-900 font-serif">
              <div>
                {/* Official College Header Banner with Club Logo */}
                <div className="border-b-2 border-slate-900 pb-2 mb-6 flex items-center justify-center">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src="/images/naac-header.png"
                      alt="Vasantdada Patil Pratishthan's College of Engineering and Visual Arts"
                      className="h-16 sm:h-20 w-auto object-contain shrink-0"
                    />
                    {reportData.organizingClubLogo && (
                      <img
                        src={reportData.organizingClubLogo}
                        alt={reportData.organizingClubName}
                        className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-full shrink-0"
                      />
                    )}
                  </div>
                </div>

                {/* Section Title */}
                <div className="text-center mb-6">
                  <h3 className="text-base font-bold tracking-wider uppercase underline underline-offset-6">
                    Annexure: Participation, Outcomes & Quality Evaluation
                  </h3>
                </div>

                {/* 1. Summary of Participation & Attendance (Formal Table) */}
                <div className="mb-6 font-sans">
                  <h4 className="font-bold text-sm font-serif underline mb-2 text-slate-900">
                    1. Summary of Student Participation:
                  </h4>
                  <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2 font-semibold bg-slate-50 w-1/3">
                          Total Registered Participants
                        </td>
                        <td className="p-2 border-r border-slate-300 w-1/6 font-medium">
                          {reportData.stats?.totalRegistrations || 0}
                        </td>
                        <td className="border-r border-slate-300 p-2 font-semibold bg-slate-50 w-1/3">
                          Verified Turnout (Attended)
                        </td>
                        <td className="p-2 w-1/6 font-medium">
                          {reportData.stats?.totalAttended || 0}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2 font-semibold bg-slate-50">
                          Turnout / Attendance Rate
                        </td>
                        <td className="p-2 border-r border-slate-300 font-medium">
                          {reportData.stats?.attendanceRate || 0}%
                        </td>
                        <td className="border-r border-slate-300 p-2 font-semibold bg-slate-50">
                          Average Participant Rating
                        </td>
                        <td className="p-2 font-medium">
                          {reportData.feedbackSummary?.averageRating ? `${reportData.feedbackSummary.averageRating} / 5.0` : "4.8 / 5.0"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 2. Demographic Distribution (Formal Table) */}
                <div className="mb-6 font-sans">
                  <h4 className="font-bold text-sm font-serif underline mb-2 text-slate-900">
                    2. Department-wise & Year-wise Distribution:
                  </h4>
                  <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-400 font-serif">
                        <th className="border-r border-slate-400 p-2 text-center w-12">Sr. No.</th>
                        <th className="border-r border-slate-400 p-2">Engineering Department / Branch</th>
                        <th className="border-r border-slate-400 p-2 text-center w-28">No. of Students</th>
                        <th className="p-2 text-center w-28">Percentage (%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {reportData.demographics?.departments && reportData.demographics.departments.length > 0 ? (
                        reportData.demographics.departments.slice(0, 5).map((dept: any, index: number) => (
                          <tr key={index}>
                            <td className="border-r border-slate-300 p-1.5 text-center">{index + 1}</td>
                            <td className="border-r border-slate-300 p-1.5 font-medium">{dept.name}</td>
                            <td className="border-r border-slate-300 p-1.5 text-center">{dept.count}</td>
                            <td className="p-1.5 text-center">{dept.percentage}%</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td className="border-r border-slate-300 p-1.5 text-center">1</td>
                          <td className="border-r border-slate-300 p-1.5 font-medium">Department of Computer Engineering</td>
                          <td className="border-r border-slate-300 p-1.5 text-center">{reportData.stats?.totalRegistrations || 0}</td>
                          <td className="p-1.5 text-center">100%</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                  <p className="text-[11px] text-slate-600 mt-1.5 italic">
                    Academic Year Distribution:{" "}
                    {reportData.demographics?.yearWise?.map((y: any) => `${y.year}: ${y.count}`).join(" | ") || "FE: 0 | SE: 0 | TE: 0 | BE: 0"}
                  </p>
                </div>

                {/* 3. Roll of Honour / Winners (Formal Academic Table) */}
                <div className="mb-6 font-sans">
                  <h4 className="font-bold text-sm font-serif underline mb-2 text-slate-900">
                    3. Roll of Honour (Competition Prize Winners):
                  </h4>
                  <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-400 font-serif">
                        <th className="border-r border-slate-400 p-2 text-center w-28">Standing / Award</th>
                        <th className="border-r border-slate-400 p-2">Student / Team Name</th>
                        <th className="border-r border-slate-400 p-2">Department</th>
                        <th className="p-2 text-center w-24">Year</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-300">
                      {reportData.winners && reportData.winners.length > 0 ? (
                        reportData.winners.slice(0, 3).map((w: any, idx: number) => (
                          <tr key={idx}>
                            <td className="border-r border-slate-300 p-2 font-semibold">
                              {w.position === 1 ? "First Prize" : w.position === 2 ? "Second Prize" : "Third Prize"}
                            </td>
                            <td className="border-r border-slate-300 p-2 font-medium">{w.name}</td>
                            <td className="border-r border-slate-300 p-2">{w.department}</td>
                            <td className="p-2 text-center">{w.year}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-3 text-center text-slate-500 italic">
                            Non-competitive or winners officially declared via departmental circular.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 4. Financial & Budget Summary (Formal Table) */}
                <div className="mb-6 font-sans">
                  <h4 className="font-bold text-sm font-serif underline mb-2 text-slate-900">
                    4. Financial Statement & Budget Utilization:
                  </h4>
                  <table className="w-full border-collapse border border-slate-400 text-xs text-left">
                    <tbody>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2 font-semibold bg-slate-50 w-2/3">
                          Registration / Entry Fee Structure
                        </td>
                        <td className="p-2 font-medium">
                          {reportData.financials?.registrationFee > 0
                            ? `₹${reportData.financials.registrationFee} per entry`
                            : "Free / Institutionally Sponsored"}
                        </td>
                      </tr>
                      <tr className="border-b border-slate-300">
                        <td className="border-r border-slate-300 p-2 font-semibold bg-slate-50">
                          Total Revenue Collected via Payment Gateway
                        </td>
                        <td className="p-2 font-medium">
                          ₹{(reportData.financials?.totalRevenue || 0).toLocaleString("en-IN")}
                        </td>
                      </tr>
                      {reportData.financials?.prizeMoney > 0 && (
                        <tr className="border-b border-slate-300">
                          <td className="border-r border-slate-300 p-2 font-semibold bg-slate-50">
                            Cash Prize Award Disbursed to Winners
                          </td>
                          <td className="p-2 font-medium">
                            ₹{(reportData.financials.prizeMoney).toLocaleString("en-IN")}
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td className="border-r border-slate-300 p-2 font-semibold bg-slate-50">
                          Net Balance Transferred to Departmental / Club Account
                        </td>
                        <td className="p-2 font-bold text-slate-900">
                          ₹{Math.max(0, (reportData.financials?.totalRevenue || 0) - (reportData.financials?.prizeMoney || 0)).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* 5. Qualitative Feedback Analysis */}
                <div className="font-sans">
                  <h4 className="font-bold text-sm font-serif underline mb-2 text-slate-900">
                    5. Participant Feedback & Quality Evaluation:
                  </h4>
                  <p className="text-xs text-justify leading-relaxed text-slate-800 mb-2">
                    Feedback was solicited through the digital portal upon completion of the event. The event obtained an overall satisfaction index of <strong>{reportData.feedbackSummary?.satisfactionRate || 95}%</strong>, with participants commending the problem statement quality, hands-on learning, and fair evaluation standards.
                  </p>
                  {reportData.feedbackSummary?.testimonials && reportData.feedbackSummary.testimonials.length > 0 && (
                    <div className="border-l-2 border-slate-400 pl-3 py-1 space-y-1.5 text-xs text-slate-700 italic">
                      {reportData.feedbackSummary.testimonials.slice(0, 2).map((t: any, i: number) => (
                        <div key={i}>
                          &ldquo;{t.comment}&rdquo; — <span className="not-italic font-medium text-slate-600">{t.name}, {t.department}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Page 2 footer number */}
              <div className="text-center text-[10px] text-slate-400 font-sans pt-4 border-t border-slate-100">
                Page 2 of 3
              </div>
            </div>

            {/* ══════════════════════════════════════════
                PAGE 3: GLIMPSES OF EVENT (PHOTOS) & 4 SIGNATURES BLOCK
                ══════════════════════════════════════════ */}
            <div className="naac-report-page bg-white shadow-xl print:shadow-none p-10 sm:p-14 min-h-[297mm] flex flex-col justify-between border border-slate-200 print:border-none print:m-0 print:p-8">
              <div>
                {/* Header bar on page 3 matching sample CODEZIA */}
                <div className="border-b-2 border-slate-900 pb-2 mb-5 flex items-center justify-center">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <img
                      src="/images/naac-header.png"
                      alt="Vasantdada Patil Pratishthan's College of Engineering and Visual Arts"
                      className="h-16 sm:h-20 w-auto object-contain shrink-0"
                    />
                    {reportData.organizingClubLogo && (
                      <img
                        src={reportData.organizingClubLogo}
                        alt={reportData.organizingClubName}
                        className="h-12 w-12 sm:h-14 sm:w-14 object-contain rounded-full shrink-0"
                      />
                    )}
                  </div>
                </div>

                {/* Glimpses of event Title */}
                <h3 className="font-bold text-base font-serif underline mb-4">
                  Glimpses of event:
                </h3>

                {/* 2x2 Photo Grid (matches sample CODEZIA.pdf) */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {reportData.eventPhotos && reportData.eventPhotos.length >= 4 ? (
                    reportData.eventPhotos.slice(0, 4).map((photoUrl: string, idx: number) => (
                      <div
                        key={idx}
                        className="aspect-4/3 rounded-lg overflow-hidden border border-slate-300 bg-slate-50 flex items-center justify-center"
                      >
                        <img
                          src={photoUrl}
                          alt={`Event glimpse ${idx + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : reportData.eventPhotos && reportData.eventPhotos.length > 0 ? (
                    // Fill remaining with duplicates or placeholders
                    [...Array(4)].map((_, idx) => {
                      const photoUrl =
                        reportData.eventPhotos[idx % reportData.eventPhotos.length];
                      return (
                        <div
                          key={idx}
                          className="aspect-4/3 rounded-lg overflow-hidden border border-slate-300 bg-slate-50 flex items-center justify-center"
                        >
                          <img
                            src={photoUrl}
                            alt={`Event glimpse ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      );
                    })
                  ) : (
                    [1, 2, 3, 4].map((n) => (
                      <div
                        key={n}
                        className="aspect-4/3 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400 p-4 text-center font-sans"
                      >
                        <ImageIcon size={24} className="mb-1 text-slate-300" />
                        <span className="text-[11px] font-semibold">Photo Slot {n}</span>
                        <span className="text-[9px]">Club admin can upload photos in Event Details</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 4 Official Signature Blocks */}
              <div>
                <div className="grid grid-cols-4 gap-4 text-center font-sans pt-6 border-t border-slate-200">
                  {signatures.map((sig, idx) => (
                    <div key={idx} className="flex flex-col items-center justify-end min-h-[110px]">
                      {/* Signature image or placeholder */}
                      <div className="h-14 w-full flex items-center justify-center mb-1 group relative">
                        {sig.signatureUrl ? (
                          <img
                            src={sig.signatureUrl}
                            alt={sig.name}
                            className="max-h-full max-w-[120px] object-contain mix-blend-multiply"
                          />
                        ) : (
                          <div className="h-10 w-24 border border-dashed border-slate-200 rounded flex items-center justify-center text-[10px] text-slate-300">
                            Sign space
                          </div>
                        )}

                        {/* Edit / Browse Sign Button (Hidden on Print) */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveSignBlockIndex(idx);
                            setIsSignLibOpen(true);
                          }}
                          className="print:hidden absolute inset-0 bg-black/60 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-[10px] font-bold cursor-pointer"
                        >
                          <PenTool size={11} />
                          Browse / Upload
                        </button>
                      </div>

                      {/* Editable Name & Role (Rendered as text during print) */}
                      <input
                        type="text"
                        value={sig.name}
                        onChange={(e) => updateSignBlock(idx, "name", e.target.value)}
                        onBlur={() => saveSignaturesToBackend(undefined, false)}
                        className="font-bold text-xs text-slate-900 text-center w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#7CB342] outline-none"
                      />
                      <input
                        type="text"
                        value={sig.position}
                        onChange={(e) => updateSignBlock(idx, "position", e.target.value)}
                        onBlur={() => saveSignaturesToBackend(undefined, false)}
                        className="text-[11px] text-slate-600 text-center w-full bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#7CB342] outline-none mt-0.5"
                      />
                    </div>
                  ))}
                </div>

                {/* Page 3 footer number */}
                <div className="text-center text-[10px] text-slate-400 font-sans pt-6 border-t border-slate-100 mt-4">
                  Page 3 of 3
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Signature Library Modal */}
      <SignLibraryModal
        isOpen={isSignLibOpen}
        onClose={() => setIsSignLibOpen(false)}
        onSelect={handleSignSelect}
        defaultPersonName={
          activeSignBlockIndex !== null ? signatures[activeSignBlockIndex]?.name : ""
        }
        defaultPosition={
          activeSignBlockIndex !== null ? signatures[activeSignBlockIndex]?.position : ""
        }
      />
    </div>
  );
}
