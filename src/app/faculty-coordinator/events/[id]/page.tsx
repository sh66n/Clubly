"use client";
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  BarElement,
} from "chart.js";
import { Pie, Line, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  BarElement,
);
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  IndianRupee,
  Eye,
  Award,
  Search,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  User,
  Star,
  X,
  PieChart,
  QrCode,
  TrendingUp,
  Receipt,
  FileText,
  Trophy,
  Lock,
  ExternalLink,
  Handshake,
  Heart,
  Image as ImageIcon,
  ShieldCheck,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { generateAttendancePDF } from "@/lib/generateAttendancePDF";

type EventStatus = "draft" | "live" | "completed";
type EventType = "team" | "individual";
type TabKey =
  | "participants"
  | "finance"
  | "feedback"
  | "winners"
  | "certificates"
  | "collab"
  | "photos";

interface CustomQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect";
  required: boolean;
  options?: string[];
}

interface RegistrationItem {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    department?: string;
    year?: number;
  };
  groupId?: {
    _id: string;
    name: string;
    members: {
      _id: string;
      name: string;
      email: string;
      image?: string;
      department?: string;
      year?: number;
    }[];
    leader: {
      _id: string;
      name: string;
      email: string;
      department?: string;
      year?: number;
    };
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

interface FeedbackAnswer {
  questionId: string;
  rating: number;
}

interface FeedbackItem {
  _id: string;
  rating?: number;
  comment?: string;
  answers?: FeedbackAnswer[];
  feedbackFormId?:
    | {
        _id: string;
        name: string;
        questions?: { id: string; text: string; required?: boolean }[];
      }
    | string;
  userId: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    department?: string;
  };
  createdAt: string;
}

interface EventDetails {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  date: string;
  registrationDeadline?: string;
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
  likedBy?: { _id: string; name: string; email: string; image?: string }[];
  points?: { participation?: number; winner?: number };
  winner?: { _id: string; name: string; email: string; image?: string };
  winnerGroup?: { _id: string; name: string };
  winners?: { position: number; user?: any; group?: any }[];
  numberOfWinners?: number;
  contact?: { _id: string; name: string; email: string; image?: string }[];
  superEvent?: { _id: string; name: string; image?: string };
  collaboratingClubs?: any[];
  eventPhotos?: string[];
  certificate?: any;
  certificatesByPosition?: {
    participation?: any;
    first?: any;
    second?: any;
    third?: any;
  };
  feedbackForm?: any;
  organizingClub?: {
    _id: string;
    name: string;
    fullName?: string;
    department?: string;
    logo?: string;
  };
}

export default function FacultyCoordinatorEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [eventPhotos, setEventPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("participants");
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [timeFilterOpen, setTimeFilterOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [downloadingBill, setDownloadingBill] = useState(false);
  const [downloadingAttendance, setDownloadingAttendance] = useState(false);
  const [questionAveragesExpanded, setQuestionAveragesExpanded] = useState(false);
  const [expandedFeedbacks, setExpandedFeedbacks] = useState<Record<string, boolean>>({});
  const [showDemographicsModal, setShowDemographicsModal] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string | null>(null);
  const billRef = useRef<HTMLDivElement>(null);

  const toggleExpandFeedback = (fbId: string) => {
    setExpandedFeedbacks((prev) => ({ ...prev, [fbId]: !prev[fbId] }));
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

      // Fetch event photos
      const photoRes = await fetch(`/api/club-admin/events/${eventId}/photos`);
      if (photoRes.ok) {
        const photoData = await photoRes.json();
        setEventPhotos(photoData.eventPhotos || []);
      }
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

  // Download Bill PDF
  const downloadBillPDF = async () => {
    if (!billRef.current || !event) return;
    try {
      setDownloadingBill(true);
      toast.info("Generating bill, please wait...");

      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.top = "-9999px";
      iframe.style.left = "-9999px";
      iframe.style.width = "794px";
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe context");

      iframeDoc.open();
      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              * { box-sizing: border-box; font-family: sans-serif; }
              body { margin: 0; padding: 24px; background: #ffffff; color: #0f172a; }
              .text-xs { font-size: 12px; }
              .text-sm { font-size: 14px; }
              .text-lg { font-size: 18px; }
              .text-2xl { font-size: 24px; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .text-slate-800 { color: #1e293b; }
              .text-slate-500 { color: #64748b; }
              .text-slate-400 { color: #94a3b8; }
              .text-right { text-align: right; }
              .border-collapse { border-collapse: collapse; }
              .divide-y > * + * { border-top: 1px solid #f1f5f9; }
              .py-3 { padding-top: 12px; padding-bottom: 12px; }
            </style>
          </head>
          <body>
            <div style="width: 794px;">
              ${billRef.current.innerHTML}
            </div>
          </body>
        </html>
      `);
      iframeDoc.close();

      await new Promise((resolve) => setTimeout(resolve, 250));

      const canvas = await html2canvas(iframeDoc.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, "PNG", 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`${event.name.replace(/\s+/g, "_")}_Bill.pdf`);

      document.body.removeChild(iframe);
      toast.success("Bill downloaded successfully");
    } catch (error: any) {
      console.error("PDF Generation error:", error);
      toast.error(`Failed to generate bill: ${error?.message || error}`);
    } finally {
      setDownloadingBill(false);
    }
  };

  // Download Attendance Sheet PDF
  const downloadAttendanceSheetPDF = async () => {
    if (!event) return;
    if (registrations.length === 0) {
      toast.error("No registrations to download");
      return;
    }

    try {
      setDownloadingAttendance(true);
      toast.info("Generating attendance sheet PDF, please wait...");
      await generateAttendancePDF(event as any, registrations as any);
      toast.success("Attendance sheet PDF downloaded successfully");
    } catch (err: any) {
      console.error("Attendance PDF generation error:", err);
      toast.error(`Failed to generate attendance sheet: ${err?.message || err}`);
    } finally {
      setDownloadingAttendance(false);
    }
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

  const filteredMetrics = useMemo(() => {
    const now = new Date();
    let currentRegs = registrations;
    let currentPayments = payments;

    if (timeFilter === "Today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      currentRegs = registrations.filter(
        (r) => new Date(r.registeredAt) >= today,
      );
      currentPayments = payments.filter((p) => new Date(p.createdAt) >= today);
    } else if (timeFilter === "Last 7 Days") {
      const last7 = new Date(now.getTime() - 7 * 86400000);
      currentRegs = registrations.filter(
        (r) => new Date(r.registeredAt) >= last7,
      );
      currentPayments = payments.filter((p) => new Date(p.createdAt) >= last7);
    } else if (timeFilter === "This Month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      currentRegs = registrations.filter(
        (r) => new Date(r.registeredAt) >= startOfMonth,
      );
      currentPayments = payments.filter(
        (p) => new Date(p.createdAt) >= startOfMonth,
      );
    }

    const regCount = currentRegs.length;
    const revenue = currentPayments.reduce(
      (acc, p) => acc + (p.amount || 0) / 100,
      0,
    );
    const attended = currentRegs.filter((r) => r.status === "attended").length;
    const absent = currentRegs.filter((r) => r.status === "absent").length;

    return {
      regCount,
      revenue,
      attended,
      absent,
    };
  }, [registrations, payments, timeFilter]);

  // Current Winners
  const currentWinners = useMemo(() => {
    if (!event) return [];
    const list: { position: number; participant: any }[] = [];
    if (event.winners && event.winners.length > 0) {
      event.winners.forEach((w) => {
        list.push({
          position: w.position,
          participant:
            event.eventType === "team" ? { groupId: w.group } : { userId: w.user },
        });
      });
    } else {
      if (event.eventType === "team" && event.winnerGroup) {
        list.push({ position: 1, participant: { groupId: event.winnerGroup } });
      } else if (event.winner) {
        list.push({ position: 1, participant: { userId: event.winner } });
      }
    }
    return list;
  }, [event]);

  // Rating Stats
  const ratingStats = useMemo(() => {
    if (feedbacks.length === 0)
      return {
        avg: "0.0",
        count: 0,
        stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } as Record<number, number>,
        questionStats: [],
      };

    let totalRatingSum = 0;
    let totalRatingsCount = 0;
    const stars: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const qMap: Record<string, { sum: number; count: number }> = {};

    feedbacks.forEach((fb) => {
      if (fb.rating) {
        totalRatingSum += fb.rating;
        totalRatingsCount++;
        const r = Math.min(5, Math.max(1, Math.round(fb.rating)));
        stars[r] = (stars[r] || 0) + 1;
      }
      if (fb.answers && Array.isArray(fb.answers)) {
        fb.answers.forEach((ans) => {
          if (ans.questionId && ans.rating) {
            if (!qMap[ans.questionId]) {
              qMap[ans.questionId] = { sum: 0, count: 0 };
            }
            qMap[ans.questionId].sum += ans.rating;
            qMap[ans.questionId].count++;
          }
        });
      }
    });

    const avg =
      totalRatingsCount > 0
        ? (totalRatingSum / totalRatingsCount).toFixed(1)
        : "0.0";

    const questionStats = Object.keys(qMap).map((qId) => ({
      questionId: qId,
      avg: (qMap[qId].sum / qMap[qId].count).toFixed(1),
      count: qMap[qId].count,
    }));

    return { avg, count: feedbacks.length, stars, questionStats };
  }, [feedbacks]);

  // Demographics
  // Demographics - Include all individual attendees AND group team members
  const departmentStats = useMemo(() => {
    const stats: Record<string, number> = {};
    registrations.forEach((reg) => {
      if (reg.userId) {
        const dept = reg.userId.department || "Not Specified";
        stats[dept] = (stats[dept] || 0) + 1;
      } else if (reg.groupId && reg.groupId.members) {
        reg.groupId.members.forEach((member) => {
          const dept = member.department || "Not Specified";
          stats[dept] = (stats[dept] || 0) + 1;
        });
      }
    });
    return Object.fromEntries(
      Object.entries(stats).sort(([, a], [, b]) => b - a),
    );
  }, [registrations]);

  const totalDemographics = useMemo(
    () => Object.values(departmentStats).reduce((a, b) => a + b, 0),
    [departmentStats],
  );

  // Cumulative Registration Trend Chart - Exactly matching club admin
  const registrationChartData = useMemo(() => {
    if (!event || !registrations || registrations.length === 0)
      return { labels: ["No Data"], values: [0] };
    const sortedRegs = [...registrations].sort(
      (a, b) =>
        new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime(),
    );
    const start = event.createdAt
      ? new Date(event.createdAt)
      : new Date(sortedRegs[0].registeredAt);
    const end =
      event.status === "completed" ? new Date(event.date) : new Date();

    const labels: string[] = [];
    const values: number[] = [];
    let currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0);
    let endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    if (endDate < currentDate) endDate = new Date();

    let cumulative = 0;
    let regIdx = 0;
    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      while (
        regIdx < sortedRegs.length &&
        new Date(sortedRegs[regIdx].registeredAt) < nextDate
      ) {
        cumulative++;
        regIdx++;
      }
      labels.push(
        currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      );
      values.push(cumulative);
      currentDate = nextDate;
    }
    return { labels, values };
  }, [event, registrations]);

  const maxRegValue = Math.max(
    ...(registrationChartData.values.length
      ? registrationChartData.values
      : [5]),
    5,
  );

  const lineChartData = useMemo(
    () => ({
      labels: registrationChartData.labels,
      datasets: [
        {
          label: "Registrations",
          data: registrationChartData.values,
          borderColor: "#7CB342",
          backgroundColor: "rgba(124,179,66,0.08)",
          tension: 0.4,
          fill: true,
          pointRadius: 3,
          pointHoverRadius: 6,
          borderWidth: 2,
        },
      ],
    }),
    [registrationChartData],
  );

  const lineChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: "#999", font: { size: 11 } },
        },
        y: {
          grid: { color: "#eee", borderDash: [4, 4] as [number, number] },
          ticks: { color: "#999", font: { size: 11 }, precision: 0 },
          min: 0,
          suggestedMax: Math.ceil(maxRegValue * 1.2),
        },
      },
    }),
    [maxRegValue],
  );

  const pieData = useMemo(
    () => ({
      labels: Object.keys(departmentStats),
      datasets: [
        {
          data: Object.values(departmentStats),
          backgroundColor: [
            "#7CB342",
            "#00BCD4",
            "#3F51B5",
            "#9C27B0",
            "#FF9800",
            "#F44336",
            "#E91E63",
            "#4CAF50",
          ],
          borderWidth: 2,
          borderColor: "#ffffff",
        },
      ],
    }),
    [departmentStats],
  );

  const allUsers = useMemo(() => {
    const list: any[] = [];
    registrations.forEach((reg: any) => {
      if (reg.userId) {
        list.push({ ...reg.userId, type: "Individual" });
      } else if (reg.groupId && reg.groupId.members) {
        reg.groupId.members.forEach((m: any) => {
          list.push({
            ...m,
            type: "Team Member",
            teamName: reg.groupId.name,
          });
        });
      }
    });
    return list;
  }, [registrations]);

  const handlePieClick = useCallback((event: any, elements: any[]) => {
    if (elements && elements.length > 0) {
      const index = elements[0].index;
      const label = pieData.labels[index];
      setSelectedDeptFilter((prev) => (prev === label ? null : label));
      setShowDemographicsModal(true);
    }
  }, [pieData.labels]);

  const pieOptions = useMemo(
    () => ({
      plugins: { legend: { display: false } },
      cutout: "70%",
      maintainAspectRatio: false,
      onClick: handlePieClick,
    }),
    [handlePieClick],
  );

  // Accurate Day-by-Day Revenue Chart - Matching club admin
  const revenueChartData = useMemo(() => {
    if (!event || !payments)
      return { labels: ["No Data"], values: [0], total: 0 };
    const sortedPayments = [...payments].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
    const start = event.createdAt
      ? new Date(event.createdAt)
      : sortedPayments.length > 0
        ? new Date(sortedPayments[0].createdAt)
        : new Date();
    const end =
      event.status === "completed" ? new Date(event.date) : new Date();

    const labels: string[] = [];
    const values: number[] = [];
    let currentDate = new Date(start);
    currentDate.setHours(0, 0, 0, 0);
    let endDate = new Date(end);
    endDate.setHours(23, 59, 59, 999);
    if (endDate < currentDate) endDate = new Date();

    let total = 0;
    let payIdx = 0;
    while (currentDate <= endDate) {
      const nextDate = new Date(currentDate);
      nextDate.setDate(nextDate.getDate() + 1);
      let dailySum = 0;
      while (
        payIdx < sortedPayments.length &&
        new Date(sortedPayments[payIdx].createdAt) < nextDate
      ) {
        dailySum += sortedPayments[payIdx].amount;
        payIdx++;
      }
      labels.push(
        currentDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      );
      values.push(dailySum / 100);
      total += dailySum;
      currentDate = nextDate;
    }
    return { labels, values, total: total / 100 };
  }, [event, payments]);

  const maxRevenueVal = Math.max(
    ...(revenueChartData.values.length ? revenueChartData.values : [5]),
    5,
  );

  const revenueBarChartData = useMemo(
    () => ({
      labels: revenueChartData.labels,
      datasets: [
        {
          label: "Revenue",
          data: revenueChartData.values,
          backgroundColor: revenueChartData.values.map((v) =>
            v === maxRevenueVal && v > 0 ? "#7CB342" : "#c5e1a5",
          ),
          borderRadius: 4,
        },
      ],
    }),
    [revenueChartData, maxRevenueVal],
  );

  const revenueBarChartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { color: "#999", font: { size: 10 } } },
        y: { display: false },
      },
    }),
    [],
  );

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

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 min-h-screen">
      {/* Top back navigation + Read-Only Monitoring Badge */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => router.push("/faculty-coordinator/dashboard")}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors outline-none cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Faculty Dashboard
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0f7e6] text-[#558B2F] border border-[#d5e9b8] rounded-full text-xs font-bold shadow-2xs">
          <ShieldCheck size={14} />
          <span>Faculty Monitoring Mode (Read-Only)</span>
        </div>
      </div>

      {/* Event Header Section */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">
        {event.image && (
          <div className="w-full lg:w-80 shrink-0 rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-50 min-h-[220px]">
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-start gap-4">
          <div className="flex flex-col gap-3 flex-grow">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                {event.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wide">
                  {event.eventType === "team"
                    ? event.teamSizeRange?.min && event.teamSizeRange?.max
                      ? `Team (${event.teamSizeRange.min}-${event.teamSizeRange.max} Members)`
                      : `Team (${event.teamSize || 1} Members)`
                    : "Individual"}{" "}
                  Format
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wide ${
                    event.status === "live"
                      ? "text-[#7CB342] bg-[#f0f7e6] border-[#c5d6a8]"
                      : event.status === "completed"
                      ? "text-blue-700 bg-blue-50 border-blue-200"
                      : "text-slate-600 bg-slate-100 border-slate-200"
                  }`}
                >
                  {event.status}
                </span>
                {event.superEvent && event.superEvent.name && (
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded flex items-center gap-1">
                    {event.superEvent.image && (
                      <img
                        src={event.superEvent.image}
                        className="w-3 h-3 rounded-full object-cover"
                        alt=""
                      />
                    )}
                    {event.superEvent.name}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-grow min-h-0">
              <p
                className={`text-sm text-slate-500 font-medium leading-relaxed max-w-3xl ${
                  !descExpanded ? "line-clamp-3 lg:line-clamp-6" : ""
                }`}
              >
                {event.description || "No description provided."}
              </p>
              {event.description && event.description.length > 250 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="text-xs font-bold text-[#7CB342] hover:text-[#689F38] mt-1 inline-flex items-center gap-0.5 transition-colors outline-none cursor-pointer"
                >
                  {descExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>

            {/* Metadata info strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 text-xs text-slate-500 font-semibold border-t border-slate-100 mt-auto">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                <span>
                  Date:{" "}
                  {eventDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </span>
              {event.registrationDeadline && (
                <span className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                  <Clock size={12} className="text-amber-600" />
                  <span>
                    Deadline:{" "}
                    {new Date(event.registrationDeadline).toLocaleDateString(
                      "en-IN",
                      {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      },
                    )}
                  </span>
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <IndianRupee size={13} className="text-slate-400" />
                {event.registrationFee > 0
                  ? event.registrationFee.toLocaleString()
                  : "Free Event"}
              </span>
              {event.eventType === "team" && (
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-slate-400" />
                  <span>
                    Size:{" "}
                    {event.teamSizeRange?.min && event.teamSizeRange?.max
                      ? `${event.teamSizeRange.min} - ${event.teamSizeRange.max}`
                      : `${event.teamSize || 1}`}
                  </span>
                </span>
              )}
              {event.maxRegistrations && (
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-slate-400" />
                  {registrations.length} / {event.maxRegistrations} Registered
                </span>
              )}
            </div>
          </div>

          {/* Action buttons - Read-only safe actions (Bill & Attendance PDF) */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap pt-2">
            <button
              onClick={downloadBillPDF}
              disabled={downloadingBill}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {downloadingBill ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Receipt size={14} />
              )}
              Download Bill
            </button>

            <button
              onClick={downloadAttendanceSheetPDF}
              disabled={downloadingAttendance}
              className="px-4 py-2 text-sm font-bold text-white bg-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {downloadingAttendance ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <FileText size={14} />
              )}
              Export Attendance PDF
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Insights Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Registration Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-[#7CB342]" />
            <h3 className="text-sm font-bold text-slate-800">
              Registration Trend
            </h3>
          </div>
          <div className="h-32 w-full flex-1">
            <Line data={lineChartData} options={lineChartOptions as any} />
          </div>
        </div>

        {/* Department Demographics */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart size={18} className="text-[#00BCD4]" />
              <h3 className="text-sm font-bold text-slate-800">Demographics</h3>
            </div>
            <button
              onClick={() => {
                setSelectedDeptFilter(null);
                setShowDemographicsModal(true);
              }}
              className="p-1.5 rounded-lg hover:bg-slate-50 transition-colors text-slate-400 hover:text-[#00BCD4] flex items-center gap-1 text-[11px] font-bold cursor-pointer"
              title="View full demographics"
            >
              <span>View All</span>
              <ChevronRight size={14} />
            </button>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div
              className="h-32 w-full relative cursor-pointer"
              onClick={() => setShowDemographicsModal(true)}
              title="Click to view all demographics"
            >
              {totalDemographics > 0 ? (
                <Pie data={pieData} options={pieOptions} />
              ) : (
                <div className="w-full h-full rounded-full border-4 border-slate-100 flex items-center justify-center">
                  <span className="text-xs font-medium text-slate-400">
                    No Data
                  </span>
                </div>
              )}
              {totalDemographics > 0 && (
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                  <span className="text-2xl font-bold text-slate-800 leading-none">
                    {totalDemographics}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    Total Users
                  </span>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-auto">
              {Object.entries(departmentStats)
                .slice(0, 4)
                .map(([dept, count], i) => (
                  <div
                    key={dept}
                    onClick={() => {
                      setSelectedDeptFilter(dept);
                      setShowDemographicsModal(true);
                    }}
                    className="flex items-center gap-1.5 min-w-0 cursor-pointer hover:opacity-75 transition-opacity"
                    title={`Filter by ${dept}`}
                  >
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: pieData.datasets[0].backgroundColor[i],
                      }}
                    />
                    <span
                      className="text-[10px] font-medium text-slate-600 truncate flex-1"
                      title={dept}
                    >
                      {dept}
                    </span>
                    <span className="text-[10px] font-bold text-slate-800 shrink-0">
                      {totalDemographics > 0
                        ? ((count / totalDemographics) * 100).toFixed(0)
                        : 0}
                      %
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl border border-slate-200/60 p-6 flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <IndianRupee size={18} className="text-emerald-500" />
              <h3 className="text-sm font-bold text-slate-800">Revenue</h3>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50/85 px-2 py-0.5 rounded border border-emerald-100 shadow-sm">
              Total: ₹{filteredMetrics.revenue.toLocaleString()}
            </span>
          </div>
          <div className="h-32 w-full flex-1">
            <Bar
              data={revenueBarChartData}
              options={revenueBarChartOptions as any}
            />
          </div>
        </div>
      </div>

      {/* Event Records Card with Tabs */}
      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Event Records
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Review participants, attendance logs, winners, feedbacks, and photos.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={downloadAttendanceSheetPDF}
              disabled={downloadingAttendance}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#7CB342] border border-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer disabled:opacity-60"
            >
              {downloadingAttendance ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <FileText size={13} />
              )}
              Export PDF
            </button>
          </div>
        </div>

        {/* Sub Header for tabs with Search bar to the right */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide bg-slate-200/50 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab("participants")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "participants"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              Participants ({registrations.length})
            </button>
            <button
              onClick={() => setActiveTab("winners")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "winners"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              Winners ({currentWinners.length})
            </button>
            <button
              onClick={() => setActiveTab("finance")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "finance"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              Transactions ({payments.length})
            </button>
            <button
              onClick={() => setActiveTab("feedback")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-1.5 cursor-pointer ${
                activeTab === "feedback"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              Feedbacks ({feedbacks.length})
            </button>
            <button
              onClick={() => setActiveTab("certificates")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "certificates"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              Certificates ({1 + (event?.numberOfWinners || 1)})
            </button>
            <button
              onClick={() => setActiveTab("collab")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "collab"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              <Handshake size={14} />
              Collab ({event?.collaboratingClubs?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab("photos")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "photos"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              <ImageIcon size={14} />
              NAAC Photos ({eventPhotos.length})
            </button>
          </div>

          {activeTab === "participants" && (
            <div className="flex items-center bg-white border border-slate-200 focus-within:border-[#7CB342] focus-within:ring-2 focus-within:ring-[#f0f7e6] rounded-xl px-3.5 py-1.5 gap-2 w-full sm:w-64 transition-all shadow-2xs">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  event.eventType === "team"
                    ? "Search team name..."
                    : "Search name..."
                }
                className="bg-transparent text-xs text-slate-900 placeholder:text-slate-400 outline-none w-full font-medium"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tab content panel */}
        <div className="max-h-[550px] overflow-auto">
          {/* TAB 1: PARTICIPANTS (Read-Only) */}
          {activeTab === "participants" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 bg-white z-10">
                  <th className="py-3.5 pl-6 pr-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase w-12">
                    #
                  </th>
                  {event.eventType === "team" && (
                    <th className="py-3.5 px-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase">
                      Team / Leader
                    </th>
                  )}
                  {event.eventType === "individual" && (
                    <th className="py-3.5 px-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase">
                      Participant
                    </th>
                  )}
                  <th className="py-3.5 px-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase">
                    Date Registered
                  </th>
                  {event.customQuestions?.map((q) => (
                    <th
                      key={q.id}
                      className="py-3.5 px-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase"
                    >
                      {q.question}
                    </th>
                  ))}
                  <th className="py-3.5 pl-4 pr-6 font-bold text-slate-400 text-[10px] tracking-wider uppercase text-right">
                    Attendance Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRegistrations.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-16 text-center text-slate-400 font-semibold text-xs"
                    >
                      No registrations logged.
                    </td>
                  </tr>
                ) : (
                  filteredRegistrations.map((reg, idx) => {
                    return (
                      <tr
                        key={reg._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 pl-6 pr-4 whitespace-nowrap text-xs font-semibold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="py-4 px-4 max-w-[220px] sm:max-w-[280px]">
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

                              <div className="flex items-center">
                                <div className="flex -space-x-2 mr-3 py-1 shrink-0">
                                  {reg.groupId?.members?.map((m) => (
                                    <div
                                      key={m._id}
                                      className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 relative shrink-0"
                                      title={m.name}
                                    >
                                      <div className="w-full h-full rounded-full overflow-hidden">
                                        {m.image ? (
                                          <img
                                            src={m.image}
                                            alt=""
                                            className="h-full w-full object-cover"
                                          />
                                        ) : (
                                          <div className="h-full w-full flex items-center justify-center text-[9px] font-black text-slate-400 uppercase">
                                            {m.name.charAt(0)}
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium truncate max-w-[100px]">
                                  Leader:{" "}
                                  <span className="font-bold text-slate-600">
                                    {reg.groupId?.leader?.name || "Unknown"}
                                  </span>
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center shrink-0 border border-[#eaeaea]">
                                {reg.userId?.image ? (
                                  <img
                                    src={reg.userId.image}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={11} className="text-slate-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-800 truncate max-w-[160px]">
                                  {reg.userId?.name || "Unknown user"}
                                </p>
                                <p className="text-[10px] text-slate-400 font-normal truncate max-w-[160px]">
                                  {reg.userId?.email}
                                </p>
                              </div>
                            </div>
                          )}
                        </td>

                        <td className="py-4 px-4 text-slate-600 font-medium text-sm">
                          {new Date(reg.registeredAt).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>

                        {event.customQuestions?.map((q) => {
                          const ansObj = reg.customQuestionAnswers?.find(
                            (ans) => ans.questionId === q.id,
                          );
                          const formattedAns = ansObj
                            ? Array.isArray(ansObj.answer)
                              ? ansObj.answer.join(", ")
                              : ansObj.answer
                            : "-";
                          return (
                            <td
                              key={q.id}
                              className="py-4 px-4 text-slate-600 font-medium text-sm max-w-[150px] truncate"
                              title={formattedAns}
                            >
                              {formattedAns}
                            </td>
                          );
                        })}

                        {/* Read-only Attendance Badge */}
                        <td className="py-4 pl-4 pr-6 text-right">
                          <span
                            className={`inline-block px-3 py-1 text-[10px] font-bold rounded-full border shadow-2xs ${
                              reg.status === "attended"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : reg.status === "absent"
                                ? "bg-rose-50 text-rose-700 border-rose-200"
                                : "bg-slate-50 text-slate-600 border-slate-200"
                            }`}
                          >
                            {reg.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

          {/* TAB 2: FINANCE (Read-Only) */}
          {activeTab === "finance" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 bg-white z-10">
                  <th className="py-3.5 pl-6 pr-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase">
                    Transaction ID
                  </th>
                  <th className="py-3.5 px-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase">
                    Participant
                  </th>
                  <th className="py-3.5 px-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase">
                    Date & Time
                  </th>
                  <th className="py-3.5 pl-4 pr-6 font-bold text-slate-400 text-[10px] tracking-wider uppercase text-right">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-16 text-center text-slate-400 font-semibold text-xs"
                    >
                      No transactions registered.
                    </td>
                  </tr>
                ) : (
                  payments.map((p) => (
                    <tr
                      key={p.razorpayOrderId}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 pl-6 pr-4 font-mono font-semibold text-xs text-slate-600">
                        {p.razorpayPaymentId || p.razorpayOrderId}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">
                            {p.userId?.name || "Participant"}
                          </p>
                          <p className="text-xs text-slate-400 font-normal">
                            {p.userId?.email}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-slate-600 font-medium text-sm">
                        {new Date(p.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-4 pl-4 pr-6 text-right font-bold text-emerald-600 text-sm">
                        ₹{Math.round(p.amount / 100).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {/* TAB 3: FEEDBACK (Read-Only) */}
          {activeTab === "feedback" && (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Rating Distribution */}
                <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                  <h4 className="text-sm font-bold text-slate-800 mb-4">
                    Rating Breakdown
                  </h4>
                  <div className="flex items-baseline gap-3 mb-5 pb-5 border-b border-slate-200/80">
                    <span className="text-4xl font-extrabold text-slate-800 tracking-tight">
                      {ratingStats.avg}
                    </span>
                    <div>
                      <div className="flex items-center gap-1 text-amber-400">
                        {[1, 2, 3, 4, 5].map((i) => {
                          const avgNum = parseFloat(ratingStats.avg) || 0;
                          return (
                            <Star
                              key={i}
                              size={16}
                              className={
                                i <= Math.round(avgNum)
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-200"
                              }
                            />
                          );
                        })}
                      </div>
                      <p className="text-xs text-slate-400 font-medium mt-1">
                        Based on {feedbacks.length}{" "}
                        {feedbacks.length === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {[5, 4, 3, 2, 1].map((rating) => {
                      const count = ratingStats.stars[rating] || 0;
                      const pct =
                        ratingStats.count > 0
                          ? ((count / ratingStats.count) * 100).toFixed(0)
                          : "0";
                      return (
                        <div
                          key={rating}
                          className="flex items-center gap-3 text-xs font-semibold text-slate-600"
                        >
                          <span className="w-6 text-slate-500 font-bold flex items-center gap-0.5">
                            {rating}{" "}
                            <Star
                              size={10}
                              className="text-amber-400 fill-amber-400"
                            />
                          </span>
                          <div className="flex-1 bg-slate-200/80 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-[#7CB342] h-full rounded-full transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-slate-400 text-xs font-medium">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Feedback Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                  {feedbacks.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-slate-200/60">
                      No feedback submissions recorded for this event yet.
                    </div>
                  ) : (
                    feedbacks.map((fb) => (
                      <div
                        key={fb._id}
                        className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-2xs hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                              {fb.userId?.image ? (
                                <img
                                  src={fb.userId.image}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={13} className="text-slate-400" />
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                {fb.userId?.name || "Student"}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                {fb.userId?.department || "Department"} •{" "}
                                {new Date(fb.createdAt).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  },
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-amber-400 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-lg text-xs font-bold">
                            <Star size={12} className="fill-amber-400" />
                            <span>{fb.rating || 5}/5</span>
                          </div>
                        </div>

                        {fb.comment && (
                          <p className="text-xs text-slate-600 mt-2 bg-slate-50/80 rounded-xl p-3 border border-slate-100 leading-relaxed">
                            "{fb.comment}"
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WINNERS (Read-Only Podium) */}
          {activeTab === "winners" && (
            <div className="p-6 sm:p-8 pb-8">
              <div className="flex flex-col items-center justify-center max-w-xl mx-auto min-h-[320px]">
                {currentWinners.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 font-semibold text-xs bg-slate-50 rounded-2xl border border-slate-200/60 w-full">
                    No winners have been announced yet.
                  </div>
                ) : (
                  <div className="w-full flex items-end justify-center gap-4 sm:gap-6 pt-4">
                    {[2, 1, 3].map((pos) => {
                      if (pos > (event.numberOfWinners || 1)) return null;
                      const winnerItem = currentWinners.find(
                        (w) => w.position === pos,
                      )?.participant;

                      let theme = {
                        color: "text-orange-500",
                        bg: "bg-orange-500",
                        lightBg: "bg-orange-50",
                        border: "border-orange-200",
                        label: "3rd Place",
                      };
                      if (pos === 1)
                        theme = {
                          color: "text-amber-500",
                          bg: "bg-amber-500",
                          lightBg: "bg-amber-50",
                          border: "border-amber-200",
                          label: "Winner (1st)",
                        };
                      if (pos === 2)
                        theme = {
                          color: "text-slate-400",
                          bg: "bg-slate-400",
                          lightBg: "bg-slate-50",
                          border: "border-slate-200",
                          label: "2nd Place",
                        };

                      const height =
                        pos === 1
                          ? "h-[160px]"
                          : pos === 2
                          ? "h-[120px]"
                          : "h-[90px]";

                      return (
                        <div
                          key={pos}
                          className="flex flex-col items-center justify-end flex-1 max-w-[180px]"
                        >
                          <div className="mb-4 w-full">
                            {winnerItem ? (
                              <div
                                className={`p-3 rounded-xl border ${theme.border} ${theme.lightBg} shadow-2xs text-center flex flex-col items-center justify-center`}
                              >
                                {event.eventType === "team" ? (
                                  <div>
                                    <Trophy
                                      size={20}
                                      className={`mx-auto mb-1 ${theme.color}`}
                                    />
                                    <p className="font-bold text-slate-800 text-xs truncate max-w-[130px]">
                                      {winnerItem.groupId?.name || "Winner Team"}
                                    </p>
                                    <span className="text-[10px] text-slate-400">
                                      Leader: {winnerItem.groupId?.leader?.name}
                                    </span>
                                  </div>
                                ) : (
                                  <div>
                                    <div className="w-10 h-10 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden mb-1.5 shadow-2xs">
                                      {winnerItem.userId?.image ? (
                                        <img
                                          src={winnerItem.userId.image}
                                          alt=""
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <User size={14} className="text-slate-400" />
                                      )}
                                    </div>
                                    <p className="font-bold text-slate-800 text-xs truncate max-w-[130px]">
                                      {winnerItem.userId?.name || "Winner"}
                                    </p>
                                    <span className="text-[10px] text-slate-400 truncate max-w-[130px] block">
                                      {winnerItem.userId?.department || "Student"}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="p-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-center">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  Unassigned
                                </span>
                              </div>
                            )}
                          </div>

                          <div
                            className={`w-full ${height} ${theme.bg} rounded-t-2xl flex flex-col items-center pt-3 shadow-inner relative overflow-hidden`}
                          >
                            <div className="absolute inset-0 bg-white/20" />
                            <span className="relative font-black text-white text-3xl opacity-90">
                              {pos}
                            </span>
                            <span className="relative text-[10px] font-bold text-white uppercase tracking-wider opacity-85 mt-1">
                              {theme.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: CERTIFICATES (Read-Only) */}
          {activeTab === "certificates" && (
            <div className="p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  {
                    title: "Participant Certificate",
                    cert:
                      event.certificatesByPosition?.participation ||
                      event.certificate,
                    label: "Awarded to Attendees",
                  },
                  {
                    title: "Winner (1st) Certificate",
                    cert: event.certificatesByPosition?.first,
                    label: "Awarded to Champion",
                  },
                  {
                    title: "2nd Place Certificate",
                    cert: event.certificatesByPosition?.second,
                    label: "Awarded to 2nd Place",
                  },
                  {
                    title: "3rd Place Certificate",
                    cert: event.certificatesByPosition?.third,
                    label: "Awarded to 3rd Place",
                  },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Award size={16} className="text-[#7CB342]" />
                        <h4 className="text-xs font-bold text-slate-800">
                          {item.title}
                        </h4>
                      </div>
                      <p className="text-[10px] text-slate-400">{item.label}</p>
                    </div>

                    <div className="h-32 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center">
                      {item.cert?.url ? (
                        <img
                          src={item.cert.url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-3">
                          <Award size={20} className="text-slate-300 mx-auto mb-1" />
                          <span className="text-[10px] font-bold text-slate-400">
                            {item.cert?.name || "Standard Template"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: COLLABORATING CLUBS (Read-Only) */}
          {activeTab === "collab" && (
            <div className="p-6">
              <h3 className="text-sm font-bold text-slate-800 mb-4">
                Collaborating Clubs
              </h3>
              {!event.collaboratingClubs ||
              event.collaboratingClubs.length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-slate-200/60">
                  No collaborating clubs for this event.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.collaboratingClubs.map((club: any) => (
                    <div
                      key={club._id || club}
                      className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-2xs"
                    >
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                        {club.logo ? (
                          <img
                            src={club.logo}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Handshake size={16} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {club.name || "Club"}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {club.department || "Department"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: NAAC PHOTOS (Read-Only Gallery) */}
          {activeTab === "photos" && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    NAAC Event Photo Glimpses
                  </h3>
                  <p className="text-xs text-slate-400">
                    Photographs curated by club admin for audit documentation.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#558B2F] bg-[#f0f7e6] border border-[#d5e9b8] px-2.5 py-1 rounded-full">
                  {eventPhotos.length} Photos
                </span>
              </div>

              {eventPhotos.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-semibold bg-slate-50 rounded-2xl border border-slate-200/60">
                  No photographs uploaded for this event yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {eventPhotos.map((url, i) => (
                    <div
                      key={i}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-video shadow-2xs hover:shadow-md transition-shadow"
                    >
                      <img
                        src={url}
                        alt={`Event glimpse ${i + 1}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80"
                        title="View Full Resolution"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Audience Likes & Admirers Section */}
      <div className="bg-white border border-slate-200/60 rounded-3xl shadow-sm overflow-hidden mb-8 p-6">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Heart size={18} className="text-rose-500 fill-rose-500" />
              Event Admirers & Engagement
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Real-time audience interaction and users who liked this event.
            </p>
          </div>
          <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <Heart size={12} className="fill-rose-500" />
            {event.likedBy?.length || event.likes} Likes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-rose-50/60 rounded-2xl p-5 border border-rose-100/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-rose-600">Total Likes</p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {event.likedBy?.length || event.likes}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
              <Heart size={20} className="fill-rose-500 text-rose-500" />
            </div>
          </div>

          <div className="bg-blue-50/60 rounded-2xl p-5 border border-blue-100/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600">
                Total Page Views
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {event.views}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <Eye size={20} />
            </div>
          </div>

          <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100/80 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600">
                Engagement Rate
              </p>
              <p className="text-2xl font-extrabold text-slate-900 mt-1">
                {event.views > 0
                  ? (
                      ((event.likedBy?.length || event.likes) / event.views) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <User size={20} />
            </div>
          </div>
        </div>

        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Liked By
        </h4>
        {!event.likedBy || event.likedBy.length === 0 ? (
          <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl font-semibold text-xs">
            {event.likes > 0
              ? `${event.likes} guest user(s) liked this event.`
              : "No likes logged for this event yet."}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {event.likedBy.map((user) => (
              <div
                key={user._id}
                className="p-3.5 bg-slate-50/50 hover:bg-white rounded-xl border border-slate-200/60 shadow-2xs flex items-center gap-3 hover:shadow-xs transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-white overflow-hidden flex items-center justify-center shrink-0 border border-slate-200">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User size={16} className="text-slate-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 text-sm truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-400 truncate">
                    {user.email}
                  </p>
                </div>
                <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                  <Heart size={11} className="fill-rose-500 text-rose-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hidden printable bill template container */}
      <div className="hidden">
        <div ref={billRef} className="p-8 bg-white text-slate-900">
          <div className="border-b border-slate-900 pb-4 mb-6">
            <h1 className="text-2xl font-bold">{event.name}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Organized by {event.organizingClub?.name || "Club"}
            </p>
            <p className="text-xs text-slate-500">
              Date: {eventDate.toLocaleDateString("en-IN")}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-2">
              Registration Financial Summary
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-500">Total Registered:</p>
                <p className="font-bold">{registrations.length}</p>
              </div>
              <div>
                <p className="text-slate-500">Total Revenue Generated:</p>
                <p className="font-bold">
                  ₹{filteredMetrics.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Full Demographics Drilldown Modal */}
      <AnimatePresence>
        {showDemographicsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#f0f7e6] text-[#558B2F] border border-[#d5e9b8] flex items-center justify-center">
                    <PieChart size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Attendee Demographics Breakdown
                    </h3>
                    <p className="text-xs text-slate-500">
                      All departments represented across all attendees & team members.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDemographicsModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Department Filter Pills */}
              <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setSelectedDeptFilter(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedDeptFilter === null
                      ? "bg-[#7CB342] text-white shadow-2xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  All Departments ({allUsers.length})
                </button>
                {Object.entries(departmentStats).map(([dept, count]) => (
                  <button
                    key={dept}
                    onClick={() =>
                      setSelectedDeptFilter(
                        selectedDeptFilter === dept ? null : dept,
                      )
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      selectedDeptFilter === dept
                        ? "bg-[#7CB342] text-white shadow-2xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {dept} ({count})
                  </button>
                ))}
              </div>

              {/* Body: Attendees list */}
              <div className="flex-1 overflow-y-auto p-6">
                {(() => {
                  const filtered = allUsers.filter((u: any) =>
                    selectedDeptFilter
                      ? (u.department || "Not Specified") === selectedDeptFilter
                      : true,
                  );

                  if (filtered.length === 0) {
                    return (
                      <div className="text-center py-16 text-slate-400 text-xs font-semibold">
                        No attendees found for this department.
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {filtered.map((u: any, idx: number) => (
                        <div
                          key={u._id || idx}
                          className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center gap-3"
                        >
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                            {u.image ? (
                              <img
                                src={u.image}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <User size={16} className="text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-800 truncate">
                              {u.name || "Student"}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {u.department || "Not Specified"}
                              {u.year ? ` • Year ${u.year}` : ""}
                            </p>
                            {u.type === "Team Member" && (
                              <span className="inline-block mt-1 text-[9px] font-bold text-[#558B2F] bg-[#f0f7e6] border border-[#d5e9b8] px-1.5 py-0.5 rounded-md truncate max-w-full">
                                Team: {u.teamName}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
                <span>
                  Showing{" "}
                  {
                    allUsers.filter((u: any) =>
                      selectedDeptFilter
                        ? (u.department || "Not Specified") === selectedDeptFilter
                        : true,
                    ).length
                  }{" "}
                  of {allUsers.length} total attendees
                </span>
                <button
                  onClick={() => setShowDemographicsModal(false)}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
