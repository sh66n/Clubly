"use client";
import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Eye,
  Heart,
  Award,
  MessageSquare,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Mail,
  User,
  Download,
  Star,
  Pencil,
  X,
  Upload,
  Link2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";

type EventStatus = "draft" | "live" | "completed";
type EventType = "team" | "individual";
type TabKey = "participants" | "finance" | "feedback";

interface CustomQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect";
  required: boolean;
  options?: string[];
}

interface RegistrationItem {
  _id: string;
  userId?: { _id: string; name: string; email: string; image?: string };
  groupId?: {
    _id: string;
    name: string;
    members: { _id: string; name: string; email: string; image?: string }[];
    leader: { _id: string; name: string; email: string };
  };
  status: "registered" | "attended" | "absent";
  registeredAt: string;
  customQuestionAnswers?: { questionId: string; answer: string | string[] }[];
}

interface PaymentItem {
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  userId: { _id: string; name: string; email: string };
  amount: number;
  createdAt: string;
}

interface FeedbackItem {
  _id: string;
  rating: number;
  comment?: string;
  userId: { _id: string; name: string; email: string; image?: string };
  createdAt: string;
}

interface EventDetails {
  _id: string;
  name: string;
  description?: string;
  date: string;
  eventType: EventType;
  status: EventStatus;
  image?: string;
  registrationFee: number;
  maxRegistrations?: number;
  providesCertificate: boolean;
  teamSize?: number;
  teamSizeRange?: { min: number; max: number };
  prize?: number;
  whatsappGroupLink?: string;
  customQuestions?: CustomQuestion[];
  certificateTemplate?: { url: string; publicId: string };
  likes: number;
  views: number;
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("participants");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // Expand states for team events
  const [expandedRegs, setExpandedRegs] = useState<Record<string, boolean>>({});

  const toggleExpandReg = (regId: string) => {
    setExpandedRegs((prev) => ({ ...prev, [regId]: !prev[regId] }));
  };

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/club-admin/events/${eventId}/details`);
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to load event details");
      }
      const data = await res.json();
      setEvent(data.event);
      setRegistrations(data.registrations || []);
      setPayments(data.payments || []);
      setFeedbacks(data.feedbacks || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    if (eventId) {
      fetchDetails();
    }
  }, [eventId, fetchDetails]);

  const handleStatusChange = async (newStatus: EventStatus) => {
    setStatusLoading(true);
    try {
      const res = await fetch(`/api/club-admin/events/${eventId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to update status");
      }
      toast.success(
        newStatus === "live"
          ? "Event published live"
          : "Event marked as completed",
      );
      fetchDetails();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setStatusLoading(false);
    }
  };

  const handleAttendanceChange = async (regId: string, newStatus: "registered" | "attended" | "absent") => {
    try {
      toast.success("Attendance status updated");
      setRegistrations((prev) =>
        prev.map((reg) => (reg._id === regId ? { ...reg, status: newStatus } : reg))
      );
    } catch (err: any) {
      toast.error("Failed to update attendance");
    }
  };

  const downloadCSV = () => {
    if (!event || registrations.length === 0) {
      toast.error("No data to download");
      return;
    }

    const headers = [
      event.eventType === "team" ? "Team Name" : "Participant Name",
      "Email/Leader Info",
      "Attendance Status",
      "Registration Date",
    ];

    if (event.eventType === "team") {
      headers.push("Team Members");
    }

    event.customQuestions?.forEach((q) => {
      headers.push(q.question);
    });

    const csvRows = [headers.join(",")];

    registrations.forEach((reg) => {
      const nameField = event.eventType === "team" 
        ? reg.groupId?.name || "Unknown Team" 
        : reg.userId?.name || "Unknown user";
      
      const emailField = event.eventType === "team"
        ? reg.groupId?.leader?.email || ""
        : reg.userId?.email || "";

      const membersField = event.eventType === "team"
        ? (reg.groupId?.members?.map((m) => m.name).join("; ") || "")
        : "";

      const row = [
        `"${nameField}"`,
        `"${emailField}"`,
        `"${reg.status}"`,
        `"${new Date(reg.registeredAt).toLocaleDateString("en-IN")}"`,
      ];

      if (event.eventType === "team") {
        row.push(`"${membersField}"`);
      }

      event.customQuestions?.forEach((q) => {
        const ansObj = reg.customQuestionAnswers?.find((ans) => ans.questionId === q.id);
        const ansVal = ansObj
          ? Array.isArray(ansObj.answer)
            ? ansObj.answer.join("; ")
            : ansObj.answer
          : "";
        row.push(`"${ansVal.toString().replace(/"/g, '""')}"`);
      });

      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${event.name.replace(/\s+/g, "_")}_participants.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRegistrations = useMemo(() => {
    if (!searchQuery.trim()) return registrations;
    const q = searchQuery.toLowerCase();
    return registrations.filter((reg) => {
      if (event?.eventType === "team") {
        return (
          reg.groupId?.name.toLowerCase().includes(q) ||
          reg.groupId?.members?.some((m) => m.name.toLowerCase().includes(q))
        );
      }
      return (
        reg.userId?.name.toLowerCase().includes(q) ||
        reg.userId?.email.toLowerCase().includes(q)
      );
    });
  }, [registrations, searchQuery, event]);

  const ratingStats = useMemo(() => {
    if (feedbacks.length === 0) return { avg: 0, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
    const stars: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    feedbacks.forEach((fb) => {
      stars[fb.rating] = (stars[fb.rating] || 0) + 1;
      sum += fb.rating;
    });
    return {
      avg: (sum / feedbacks.length).toFixed(1),
      stars,
    };
  }, [feedbacks]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <ClublyLoader />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-sm mx-auto mt-10">
        <AlertTriangle size={24} className="text-slate-400 mx-auto mb-2" />
        <p className="font-bold text-slate-800 text-sm">Failed to connect</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
        <button
          onClick={fetchDetails}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const eventDate = new Date(event.date);
  const conversionRate = event.views > 0 
    ? ((registrations.length / event.views) * 100).toFixed(1) 
    : "0.0";

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16 text-[#333]">
      {/* Back button */}
      <button
        onClick={() => router.push("/club-admin/events")}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-650 transition-colors outline-none"
      >
        <ArrowLeft size={14} /> Back to Events
      </button>

      {/* Main Header Card */}
      <div className="bg-white border border-[#eaeaea] rounded-xl p-5 flex flex-col md:flex-row gap-5 items-start">
        {event.image && (
          <div className="w-full md:w-44 h-28 rounded-lg overflow-hidden shrink-0 border border-slate-100">
            <img src={event.image} alt="" className="w-full h-full object-cover" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide bg-slate-100 px-1.5 py-0.5 rounded">
              {event.eventType} Format
            </span>
            <span className="text-[9px] font-bold text-[#7CB342] bg-[#f0f7e6] uppercase tracking-wide px-1.5 py-0.5 rounded">
              {event.status}
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-800 leading-snug">{event.name}</h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-2xl font-medium">
            {event.description || "No description provided."}
          </p>

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={() => setEditDrawerOpen(true)}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 outline-none"
            >
              <Pencil size={12} />
              Edit Event
            </button>

            {event.status === "draft" && (
              <button
                onClick={() => handleStatusChange("live")}
                disabled={statusLoading}
                className="px-3.5 py-1.5 text-xs font-bold text-white bg-[#7CB342] hover:bg-[#689f38] rounded-lg transition-colors flex items-center gap-1 outline-none"
              >
                {statusLoading && <Loader2 size={12} className="animate-spin" />}
                Publish Live
              </button>
            )}

            {event.status === "live" && (
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={statusLoading}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 outline-none"
              >
                {statusLoading && <Loader2 size={12} className="animate-spin" />}
                Complete Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#eaeaea] rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Registrations
          </span>
          <span className="text-lg font-bold text-slate-800 block mt-1">
            {registrations.length}
          </span>
        </div>

        <div className="bg-white border border-[#eaeaea] rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Conversion Rate
          </span>
          <span className="text-lg font-bold text-slate-800 block mt-1">
            {conversionRate}%
          </span>
        </div>

        <div className="bg-white border border-[#eaeaea] rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Revenue
          </span>
          <span className="text-lg font-bold text-emerald-600 block mt-1">
            ₹{(payments.reduce((acc, p) => acc + p.amount, 0) / 100).toLocaleString()}
          </span>
        </div>

        <div className="bg-white border border-[#eaeaea] rounded-xl p-4 shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Engagement Index
          </span>
          <span className="text-lg font-bold text-slate-800 block mt-1">
            {event.likes} <span className="text-xs text-slate-400">Likes</span> / {event.views} <span className="text-xs text-slate-400">Views</span>
          </span>
        </div>
      </div>

      {/* Console Tab Section */}
      <div className="bg-white border border-[#eaeaea] rounded-xl shadow-sm overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-3.5 border-b border-[#eaeaea] bg-[#fafafa]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveTab("participants")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors outline-none shrink-0 ${
                activeTab === "participants"
                  ? "text-slate-800 bg-white border border-[#e0e0e0]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Participants ({registrations.length})
            </button>
            <button
              onClick={() => setActiveTab("finance")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors outline-none shrink-0 ${
                activeTab === "finance"
                  ? "text-slate-800 bg-white border border-[#e0e0e0]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Transactions ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors outline-none shrink-0 ${
                activeTab === "feedback"
                  ? "text-slate-800 bg-white border border-[#e0e0e0]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Reviews ({feedbacks.length})
            </button>
          </div>

          {activeTab === "participants" && (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={downloadCSV}
                className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5 outline-none shrink-0"
              >
                <Download size={13} />
                Download CSV
              </button>
              <div className="flex items-center bg-white border border-slate-200 rounded-lg px-3 py-1.5 gap-2 w-full sm:w-56">
                <Search size={13} className="text-slate-450 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={event.eventType === "team" ? "Search team name..." : "Search name..."}
                  className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none w-full font-semibold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab content panel */}
        <div className="p-5">
          {activeTab === "participants" && (
            <div className="overflow-visible">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#eaeaea] text-[#999] uppercase tracking-wider text-[9px] font-bold">
                    {event.eventType === "team" && <th className="py-2.5 px-2">Team / Leader</th>}
                    {event.eventType === "individual" && <th className="py-2.5 px-2">Participant</th>}
                    <th className="py-2.5 px-2">Date Registered</th>
                    {event.customQuestions?.map((q) => (
                      <th key={q.id} className="py-2.5 px-2">{q.question}</th>
                    ))}
                    <th className="py-2.5 px-2 text-right">Attendance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fafafa]">
                  {filteredRegistrations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-10 text-center text-slate-400 font-medium">
                        No registrations logged.
                      </td>
                    </tr>
                  ) : (
                    filteredRegistrations.map((reg) => {
                      return (
                        <tr key={reg._id} className="hover:bg-[#fafafa]/50 transition-colors">
                          <td className="py-5 px-2 max-w-[220px] sm:max-w-[280px]">
                            {event.eventType === "team" ? (
                              <div className="space-y-2 py-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-bold text-slate-800 text-sm truncate max-w-[150px]">
                                    {reg.groupId?.name || "Unknown Team"}
                                  </p>
                                  <span className="text-[9px] font-bold text-[#7CB342] bg-[#f0f7e6] border border-[#7CB342]/10 px-1.5 py-0.5 rounded-sm shrink-0">
                                    {reg.groupId?.members?.length || 0} Members
                                  </span>
                                </div>
                                
                                {/* Overlapping Avatar Stack with Interactive Hover Animations */}
                                <div className="flex items-center">
                                  <div className="flex -space-x-2 mr-3 py-1 shrink-0">
                                    {reg.groupId?.members?.map((m, idx) => (
                                      <div 
                                        key={m._id} 
                                        className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 relative group shrink-0 hover:scale-125 hover:z-30 transition-all duration-150 cursor-pointer"
                                      >
                                        <div className="w-full h-full rounded-full overflow-hidden">
                                          {m.image ? (
                                            <img src={m.image} alt="" className="h-full w-full object-cover" />
                                          ) : (
                                            <div className="h-full w-full flex items-center justify-center text-[9px] font-black text-slate-450 uppercase">
                                              {m.name.charAt(0)}
                                            </div>
                                          )}
                                        </div>
                                        {m._id === reg.groupId?.leader?._id && (
                                          <div className="absolute inset-0 border border-[#7CB342] rounded-full" />
                                        )}
                                        
                                        {/* Minimalist Creme Tooltip positioned downwards */}
                                        <div className={`opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 bg-[#FAF6EE] text-slate-700 text-[10px] px-2 py-1 rounded border border-[#E8DFD0] absolute top-full mt-1.5 whitespace-nowrap z-50 shadow-sm font-semibold leading-none ${
                                          idx === 0 ? "left-0 translate-x-0" : "left-1/2 -translate-x-1/2"
                                        }`}>
                                          {/* Creme arrow tail */}
                                          <div className={`absolute bottom-full w-0 h-0 border-4 border-transparent border-b-[#E8DFD0] ${
                                            idx === 0 ? "left-3" : "left-1/2 -translate-x-1/2"
                                          }`} />
                                          <div className={`absolute bottom-full w-0 h-0 border-[3px] border-transparent border-b-[#FAF6EE] translate-y-[1px] ${
                                            idx === 0 ? "left-[13px]" : "left-1/2 -translate-x-1/2"
                                          }`} />
                                          <span>{m.name}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                                    Leader: <span className="font-bold text-slate-600">{reg.groupId?.leader?.name || "Unknown"}</span>
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-[#eaeaea]">
                                  {reg.userId?.image ? (
                                    <img src={reg.userId.image} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <User size={11} className="text-slate-400" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <p className="font-bold text-slate-800 truncate max-w-[160px]">{reg.userId?.name || "Unknown user"}</p>
                                  <p className="text-[10px] text-slate-400 font-normal truncate max-w-[160px]">{reg.userId?.email}</p>
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3 px-2 text-slate-400 font-medium">
                            {new Date(reg.registeredAt).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>

                          {event.customQuestions?.map((q) => {
                            const ansObj = reg.customQuestionAnswers?.find((ans) => ans.questionId === q.id);
                            const formattedAns = ansObj
                              ? Array.isArray(ansObj.answer)
                                ? ansObj.answer.join(", ")
                                : ansObj.answer
                              : "-";
                            return (
                              <td key={q.id} className="py-3 px-2 text-slate-500 font-medium max-w-xs truncate">
                                {formattedAns}
                              </td>
                            );
                          })}

                          <td className="py-3 px-2 text-right">
                            <select
                              value={reg.status}
                              onChange={(e) => handleAttendanceChange(reg._id, e.target.value as any)}
                              className={`px-2 py-0.5 text-[10px] font-bold rounded border outline-none cursor-pointer ${
                                reg.status === "attended"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : reg.status === "absent"
                                    ? "bg-rose-50 text-rose-700 border-rose-200"
                                    : "bg-slate-50 text-slate-655 border-slate-200"
                              }`}
                            >
                              <option value="registered">Registered</option>
                              <option value="attended">Attended</option>
                              <option value="absent">Absent</option>
                            </select>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "finance" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#eaeaea] text-[#999] uppercase tracking-wider text-[9px] font-bold">
                    <th className="py-2.5">Transaction ID</th>
                    <th className="py-2.5">User</th>
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#fafafa]">
                  {payments.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400">
                        No transactions registered.
                      </td>
                    </tr>
                  ) : (
                    payments.map((p) => (
                      <tr key={p.razorpayOrderId} className="hover:bg-[#fafafa]/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-600 font-mono">
                          {p.razorpayPaymentId || p.razorpayOrderId}
                        </td>
                        <td className="py-3 font-semibold text-slate-700">
                          <div>
                            <p className="font-bold">{p.userId?.name}</p>
                            <p className="text-[9px] text-slate-400 font-normal">{p.userId?.email}</p>
                          </div>
                        </td>
                        <td className="py-3 text-slate-400 font-medium">
                          {new Date(p.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 text-right font-bold text-emerald-600">
                          ₹{Math.round(p.amount / 100)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "feedback" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Star Rating Distribution chart */}
              <div className="bg-[#fafafa] rounded-xl p-4 border border-[#eaeaea] h-fit">
                <h4 className="text-xs font-bold text-slate-700 mb-3">Rating Breakdown</h4>
                <div className="space-y-1.5">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingStats.stars[rating] || 0;
                    const pct = feedbacks.length > 0 
                      ? ((count / feedbacks.length) * 100).toFixed(0)
                      : "0";
                    return (
                      <div key={rating} className="flex items-center gap-2 text-[10px] font-semibold text-slate-500">
                        <span className="w-3">{rating}★</span>
                        <div className="flex-1 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-amber-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-6 text-right text-slate-400">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Feedbacks list */}
              <div className="md:col-span-2 space-y-3">
                {feedbacks.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    No rating reviews logged.
                  </div>
                ) : (
                  feedbacks.map((fb) => (
                    <div key={fb._id} className="p-4 bg-white rounded-xl border border-[#eaeaea] shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{fb.userId.name}</span>
                        </div>
                        <div className="flex items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              size={10}
                              className={i <= fb.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"}
                            />
                          ))}
                        </div>
                      </div>
                      {fb.comment && (
                        <p className="text-slate-500 mt-2.5 leading-relaxed text-xs font-medium">{fb.comment}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Drawer Integration */}
      {editDrawerOpen && event && (
        <CreateEditDrawer
          open={editDrawerOpen}
          editEvent={event as any}
          onClose={() => setEditDrawerOpen(false)}
          onSuccess={fetchDetails}
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Create & Edit Event Drawer (Unmodified)
   ═══════════════════════════════════════════ */
function CreateEditDrawer({
  open,
  editEvent,
  onClose,
  onSuccess,
}: {
  open: boolean;
  editEvent: EventDetails | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const isEdit = !!editEvent;
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const certInputRef = useRef<HTMLInputElement>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00");
  const [eventType, setEventType] = useState<EventType>("individual");
  const [teamSize, setTeamSize] = useState("");
  const [teamSizeMin, setTeamSizeMin] = useState("");
  const [teamSizeMax, setTeamSizeMax] = useState("");
  const [registrationFee, setRegistrationFee] = useState("0");
  const [prize, setPrize] = useState("");
  const [maxRegistrations, setMaxRegistrations] = useState("");
  const [whatsappLink, setWhatsappLink] = useState("");
  const [providesCertificate, setProvidesCertificate] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPreview, setCertPreview] = useState<string | null>(null);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  useEffect(() => {
    if (open && editEvent) {
      setName(editEvent.name);
      setDescription(editEvent.description || "");
      const d = new Date(editEvent.date);
      setDate(d.toISOString().split("T")[0]);
      setTime(
        `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`,
      );
      setEventType(editEvent.eventType);
      setTeamSize(editEvent.teamSize?.toString() || "");
      setTeamSizeMin(editEvent.teamSizeRange?.min?.toString() || "");
      setTeamSizeMax(editEvent.teamSizeRange?.max?.toString() || "");
      setRegistrationFee(editEvent.registrationFee?.toString() || "0");
      setPrize(editEvent.prize?.toString() || "");
      setMaxRegistrations(editEvent.maxRegistrations?.toString() || "");
      setWhatsappLink(editEvent.whatsappGroupLink || "");
      setProvidesCertificate(editEvent.providesCertificate);
      setImagePreview(editEvent.image || null);
      setCertPreview(editEvent.certificateTemplate?.url || null);
      setCustomQuestions(editEvent.customQuestions || []);
    }
  }, [open, editEvent]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleCertSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCertFile(file);
      setCertPreview(URL.createObjectURL(file));
    }
  };

  const addQuestion = () => {
    setCustomQuestions((prev) => [
      ...prev,
      {
        id: `q-${Date.now()}`,
        question: "",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  };

  const removeQuestion = (idx: number) => {
    setCustomQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateQuestion = (idx: number, updates: Partial<CustomQuestion>) => {
    setCustomQuestions((prev) =>
      prev.map((q, i) => (i === idx ? { ...q, ...updates } : q)),
    );
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!name.trim()) {
      toast.error("Event name is required");
      setStep(1);
      return;
    }
    if (!date) {
      toast.error("Event date is required");
      setStep(1);
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("date", date);
      formData.append("eventTime", time);
      formData.append("eventType", eventType);
      formData.append("providesCertificate", String(providesCertificate));
      formData.append("registrationFee", registrationFee || "0");
      formData.append("status", asDraft ? "draft" : editEvent?.status || "live");

      if (eventType === "team") {
        if (teamSizeMin && teamSizeMax) {
          formData.append("teamSizeRange[min]", teamSizeMin);
          formData.append("teamSizeRange[max]", teamSizeMax);
        } else if (teamSize) {
          formData.append("teamSize", teamSize);
        }
      }
      if (prize) formData.append("prize", prize);
      if (maxRegistrations) formData.append("maxRegistrations", maxRegistrations);
      if (whatsappLink) formData.append("whatsappGroupLink", whatsappLink);

      if (customQuestions.length > 0) {
        formData.append("customQuestions", JSON.stringify(customQuestions));
      }

      if (imageFile) formData.append("image", imageFile);
      if (certFile) formData.append("certificateTemplateImage", certFile);

      const url = `/api/club-admin/events/${editEvent?._id}`;

      const res = await fetch(url, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save event");
      }

      toast.success("Event updated successfully");
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end text-slate-800">
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full z-10 border-l border-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Edit event details
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Step {step} of 3
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-50 text-slate-400 hover:text-slate-655 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 px-6 pt-4">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? "bg-slate-700" : "bg-slate-105"
              }`}
            />
          ))}
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Event Title
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Annual Codethon"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-slate-400 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Tell your members about guidelines, schedules..."
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-slate-400 outline-none resize-none text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-slate-400 outline-none text-slate-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-slate-400 outline-none text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-2">
                  Event Format
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["individual", "team"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setEventType(type)}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold transition-colors ${
                        eventType === type
                          ? "border-slate-800 bg-slate-800 text-white"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      {type === "individual" ? "Individual" : "Team event"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Banner Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageSelect}
                />
                {imagePreview ? (
                  <div className="relative rounded-lg overflow-hidden border border-slate-250">
                    <img
                      src={imagePreview}
                      alt="Banner"
                      className="w-full h-28 object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded bg-slate-900/60 text-white flex items-center justify-center text-[10px]"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 border border-dashed border-slate-200 hover:border-slate-350 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-slate-655 transition-colors gap-1 text-xs"
                  >
                    <Upload size={16} />
                    <span>Upload image banner</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Registration Fee (₹)
                </label>
                <input
                  type="number"
                  value={registrationFee}
                  onChange={(e) => setRegistrationFee(e.target.value)}
                  min={0}
                  placeholder="0 for free"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-slate-400 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Prize Pool (₹)
                </label>
                <input
                  type="number"
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  min={0}
                  placeholder="Optional"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-slate-400 outline-none text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  Max registrations
                </label>
                <input
                  type="number"
                  value={maxRegistrations}
                  onChange={(e) => setMaxRegistrations(e.target.value)}
                  min={1}
                  placeholder="Leave empty for unlimited signups"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:border-slate-400 outline-none text-slate-800"
                />
              </div>

              {eventType === "team" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">
                    Team Sizes
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        Exact size
                      </span>
                      <input
                        type="number"
                        value={teamSize}
                        onChange={(e) => {
                          setTeamSize(e.target.value);
                          setTeamSizeMin("");
                          setTeamSizeMax("");
                        }}
                        placeholder="e.g. 4"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        Min
                      </span>
                      <input
                        type="number"
                        value={teamSizeMin}
                        onChange={(e) => {
                          setTeamSizeMin(e.target.value);
                          setTeamSize("");
                        }}
                        placeholder="Min"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block mb-0.5">
                        Max
                      </span>
                      <input
                        type="number"
                        value={teamSizeMax}
                        onChange={(e) => {
                          setTeamSizeMax(e.target.value);
                          setTeamSize("");
                        }}
                        placeholder="Max"
                        className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-slate-400 text-slate-800"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">
                  WhatsApp Group Link
                </label>
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg px-3 py-2 bg-white focus-within:border-slate-400">
                  <Link2 size={14} className="text-slate-350" />
                  <input
                    value={whatsappLink}
                    onChange={(e) => setWhatsappLink(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    className="w-full bg-transparent text-xs outline-none text-slate-800"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {/* Certificate */}
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800">
                      Provide Certificates
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Send digital certificates after completed attendance
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProvidesCertificate(!providesCertificate)}
                    className={`w-9 h-5 rounded-full transition-colors relative outline-none ${
                      providesCertificate ? "bg-slate-800" : "bg-slate-200"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
                        providesCertificate ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </div>

                {providesCertificate && (
                  <div className="mt-3 pt-3 border-t border-slate-200">
                    <input
                      ref={certInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleCertSelect}
                    />
                    {certPreview ? (
                      <div className="relative rounded border border-slate-200 bg-white p-1">
                        <img
                          src={certPreview}
                          alt=""
                          className="w-full h-24 object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCertFile(null);
                            setCertPreview(null);
                          }}
                          className="absolute top-2 right-2 w-5 h-5 rounded bg-slate-900/60 text-white flex items-center justify-center text-[8px]"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => certInputRef.current?.click()}
                        className="w-full py-4 border border-dashed border-slate-200 hover:border-slate-350 bg-white rounded flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-655 text-[11px]"
                      >
                        <Award size={16} />
                        <span>Upload cert template</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Questions */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-500">
                    Custom Registration Questions
                  </label>
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1 outline-none"
                  >
                    + Add Field
                  </button>
                </div>

                {customQuestions.length === 0 ? (
                  <p className="text-xs text-slate-400 border border-slate-150 border-dashed rounded-lg p-4 text-center">
                    No custom fields. Setup custom drop-downs if needed.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {customQuestions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="bg-slate-55 border border-slate-200 rounded-lg p-3.5 relative"
                      >
                        <button
                          type="button"
                          onClick={() => removeQuestion(idx)}
                          className="absolute top-2 right-2 text-slate-350 hover:text-red-500"
                        >
                          ✕
                        </button>
                        <input
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(idx, { question: e.target.value })
                          }
                          placeholder="Label (e.g. Food Preference)"
                          className="w-[90%] px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg mb-2 focus:border-slate-400 outline-none text-slate-800"
                        />
                        <div className="flex items-center gap-3">
                          <select
                            value={q.type}
                            onChange={(e) =>
                              updateQuestion(idx, {
                                type: e.target.value as any,
                              })
                            }
                            className="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-655 outline-none"
                          >
                            <option value="text">Text Box</option>
                            <option value="select">Dropdown Menu</option>
                            <option value="multiselect">Checkboxes</option>
                          </select>
                          <label className="flex items-center gap-1 text-xs text-slate-500">
                            <input
                              type="checkbox"
                              checked={q.required}
                              onChange={(e) =>
                                updateQuestion(idx, {
                                  required: e.target.checked,
                                })
                              }
                              className="rounded"
                            />
                            Required
                          </label>
                        </div>
                        {(q.type === "select" || q.type === "multiselect") && (
                          <input
                            placeholder="Options (comma-separated: Veg, Non-Veg)"
                            value={q.options?.join(", ") || ""}
                            onChange={(e) =>
                              updateQuestion(idx, {
                                options: e.target.value
                                  .split(",")
                                  .map((o) => o.trim())
                                  .filter(Boolean),
                              })
                            }
                            className="w-full mt-2 px-2.5 py-1.5 text-xs border border-slate-200 rounded outline-none focus:border-slate-400 text-slate-700"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="border-t border-slate-100 px-6 py-4 bg-slate-50 flex items-center justify-between gap-2.5">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-slate-555 bg-white border border-slate-200 rounded-lg hover:bg-slate-55 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
              >
                Continue
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-1"
              >
                {loading && <Loader2 size={12} className="animate-spin" />}
                Save Changes
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
