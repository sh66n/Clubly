"use client";
import React, { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  FileText,
  Search,
  Filter,
  Download,
  Calendar,
  Loader2,
  CheckCircle2,
  Clock,
  User,
} from "lucide-react";
import { toast } from "sonner";
import { generateAttendancePDF } from "@/lib/generateAttendancePDF";
import { useAcademicYear } from "@/context/AcademicYearContext";

export default function AttendanceTab() {
  const { academicYear } = useAcademicYear();
  const [events, setEvents] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedEventId) params.append("eventId", selectedEventId);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);
      if (academicYear) params.append("academicYear", academicYear);

      const res = await fetch(`/api/faculty-coordinator/attendance?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch attendance data");
      const data = await res.json();
      setEvents(data.events || []);
      setRecords(data.attendanceRecords || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // When academic year changes, reset selectedEventId
    setSelectedEventId("");
  }, [academicYear]);

  useEffect(() => {
    fetchAttendance();
  }, [selectedEventId, startDate, endDate, academicYear]);

  const filteredRecords = records.filter((r) => {
    if (statusFilter !== "all" && r.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.studentName?.toLowerCase().includes(q) ||
      r.studentEmail?.toLowerCase().includes(q) ||
      r.eventName?.toLowerCase().includes(q) ||
      r.department?.toLowerCase().includes(q)
    );
  });

  // Export to Excel / CSV
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) {
      toast.error("No records to export");
      return;
    }

    const headers = [
      "Event Name",
      "Event Date",
      "Student Name",
      "Email",
      "Department",
      "Year",
      "Status",
      "Registered At",
      "Attended At",
    ];

    const rows = filteredRecords.map((r) => [
      `"${r.eventName}"`,
      `"${r.eventDate ? new Date(r.eventDate).toLocaleDateString() : ""}"`,
      `"${r.studentName}"`,
      `"${r.studentEmail}"`,
      `"${r.department}"`,
      `"${r.year}"`,
      `"${r.status}"`,
      `"${r.registeredAt ? new Date(r.registeredAt).toLocaleString() : ""}"`,
      `"${r.attendedAt ? new Date(r.attendedAt).toLocaleString() : ""}"`,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `attendance_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV report downloaded successfully!");
  };

  // Export official PDF for specific event
  const handleExportPDF = async () => {
    if (!selectedEventId) {
      toast.error("Please select a specific event from the dropdown to export its official letterhead PDF");
      return;
    }

    try {
      setExportingPDF(true);
      // Fetch full event details & registrations
      const res = await fetch(`/api/events/${selectedEventId}`);
      if (!res.ok) throw new Error("Failed to load event data for PDF");
      const eventData = await res.json();

      const regRes = await fetch(`/api/events/${selectedEventId}/attendance`);
      const regData = await regRes.json();

      await generateAttendancePDF(
        eventData,
        regData.registrations || []
      );

      toast.success("Official attendance PDF generated!");
    } catch (err: any) {
      toast.error(err.message || "Failed to generate PDF");
    } finally {
      setExportingPDF(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <FileSpreadsheet size={18} className="text-[#7CB342]" />
              Attendance & Participation Reports
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Filter by event and date range to audit attendance or export for HOD / NAAC filing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              Export CSV / Excel
            </button>
            <button
              onClick={handleExportPDF}
              disabled={exportingPDF || !selectedEventId}
              className="px-3.5 py-2 text-xs font-bold text-white bg-[#7CB342] hover:bg-[#689F38] rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {exportingPDF ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              Export Official PDF
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-1">
          {/* Event Select */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#7CB342]"
            >
              <option value="">All Events in {academicYear}</option>
              {events.map((ev) => (
                <option key={ev.id} value={ev.id}>
                  {ev.name} {ev.date ? `(${new Date(ev.date).toLocaleDateString()})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status Filter
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#7CB342]"
            >
              <option value="all">All Statuses</option>
              <option value="attended">Attended Only</option>
              <option value="registered">Registered (Pending)</option>
              <option value="absent">Absent</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#7CB342]"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-[#7CB342]"
            />
          </div>
        </div>

        {/* Search bar */}
        <div className="pt-2">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 gap-2">
            <Search size={14} className="text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Search by student name, email, department, or event name…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-xs text-slate-800 placeholder:text-slate-400 outline-none w-full"
            />
          </div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Records Found: <span className="text-[#558B2F]">{filteredRecords.length}</span>
          </span>
          <span className="text-xs font-medium text-slate-500">
            Attended:{" "}
            <span className="font-bold text-emerald-600">
              {filteredRecords.filter((r) => r.status === "attended").length}
            </span>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Department / Year</th>
                <th className="py-3 px-4">Event</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <Loader2 size={24} className="animate-spin text-[#7CB342] mx-auto" />
                  </td>
                </tr>
              ) : filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No attendance records match your filters.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-bold text-slate-800">{r.studentName}</p>
                        <p className="text-[10px] text-slate-400">{r.studentEmail}</p>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      <p className="font-medium">{r.department}</p>
                      <p className="text-[10px] text-slate-400">Year: {r.year}</p>
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-800">{r.eventName}</p>
                      {r.teamName && (
                        <p className="text-[10px] text-[#558B2F] font-semibold">
                          Team: {r.teamName}
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                      {r.eventDate
                        ? new Date(r.eventDate).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "N/A"}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === "attended"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                            : r.status === "registered"
                            ? "bg-amber-50 text-amber-600 border border-amber-200"
                            : "bg-red-50 text-red-600 border border-red-200"
                        }`}
                      >
                        {r.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[10px] whitespace-nowrap">
                      {r.attendedAt
                        ? new Date(r.attendedAt).toLocaleString("en-IN")
                        : r.registeredAt
                        ? new Date(r.registeredAt).toLocaleString("en-IN")
                        : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
