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
  PieChart,
  Link2,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  ChevronRight,
  QrCode,
  TrendingUp,
  Receipt,
  FileText,
  Trophy,
  Lock,
  ExternalLink,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type EventStatus = "draft" | "live" | "completed";
type EventType = "team" | "individual";
type TabKey = "participants" | "finance" | "feedback" | "likes" | "winners" | "certificates";

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
  };
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

interface FeedbackAnswer {
  questionId: string;
  rating: number;
}

interface FeedbackItem {
  _id: string;
  rating?: number;
  comment?: string;
  answers?: FeedbackAnswer[];
  feedbackFormId?: {
    _id: string;
    name: string;
    questions?: { id: string; text: string; required?: boolean }[];
  } | string;
  userId: { _id: string; name: string; email: string; image?: string; department?: string };
  createdAt: string;
}

interface EventDetails {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
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
  likedBy?: { _id: string; name: string; email: string; image?: string }[];
  points?: { participation?: number; winner?: number };
  winner?: { _id: string; name: string; email: string; image?: string };
  winnerGroup?: { _id: string; name: string };
  winners?: { position: number; user?: any; group?: any }[];
  numberOfWinners?: number;
  contact?: { _id: string; name: string; email: string; image?: string }[];
  superEvent?: { _id: string; name: string; image?: string };
  customQuestions?: {
    id: string;
    question: string;
    type: string;
    required: boolean;
    options: string[];
  }[];
}

interface GroupItem {
  _id: string;
  name: string;
  members: {
    _id: string;
    name: string;
    email: string;
    image?: string;
    department?: string;
  }[];
  leader: { _id: string; name: string; email: string; department?: string };
  isPublic: boolean;
  maxSize: number;
}

function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-300 text-slate-400 text-[10px] font-bold cursor-help ml-2">
      i
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max max-w-xs bg-slate-800 text-white text-xs p-2 rounded shadow-lg z-50 font-normal">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-800"></div>
      </div>
    </div>
  );
}

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [groups, setGroups] = useState<GroupItem[]>([]);
  const [availableCertificates, setAvailableCertificates] = useState<any[]>([]);
  const [availableFeedbackForms, setAvailableFeedbackForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabKey>("participants");
  const [searchQuery, setSearchQuery] = useState("");
  const [winnerSearchQuery, setWinnerSearchQuery] = useState("");
  const [statusLoading, setStatusLoading] = useState(false);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [timeFilterOpen, setTimeFilterOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [downloadingBill, setDownloadingBill] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [openDropdownPos, setOpenDropdownPos] = useState<number | null>(null);
  const billRef = useRef<HTMLDivElement>(null);

  // Expand states for team events
  const [expandedRegs, setExpandedRegs] = useState<Record<string, boolean>>({});

  const toggleExpandReg = (regId: string) => {
    setExpandedRegs((prev) => ({ ...prev, [regId]: !prev[regId] }));
  };

  // Expand states for feedback question ratings (closed by default)
  const [questionAveragesExpanded, setQuestionAveragesExpanded] = useState(false);
  const [expandedFeedbacks, setExpandedFeedbacks] = useState<Record<string, boolean>>({});

  const toggleExpandFeedback = (fbId: string) => {
    setExpandedFeedbacks((prev) => ({ ...prev, [fbId]: !prev[fbId] }));
  };

  // Custom dropdown state for certificate assignment
  const [activeCertDropdownTier, setActiveCertDropdownTier] = useState<string | null>(null);

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
      setGroups(data.groups || []);
      
      const certRes = await fetch("/api/club-admin/certificates");
      if (certRes.ok) {
        const certData = await certRes.json();
        setAvailableCertificates(Array.isArray(certData) ? certData : certData.certificates || []);
      }
      
      const feedbackRes = await fetch("/api/club-admin/feedback-forms");
      if (feedbackRes.ok) {
        const feedbackData = await feedbackRes.json();
        setAvailableFeedbackForms(feedbackData.forms || []);
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

  const updateEventCertificates = async (payload: Record<string, any>) => {
    try {
      const formData = new FormData();
      Object.entries(payload).forEach(([k, v]) => {
        if (v !== undefined) {
          formData.append(k, String(v));
        }
      });
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        body: formData,
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to update configuration");
      }
      toast.success("Configuration updated successfully");
      fetchDetails();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleAttendanceChange = async (
    regId: string,
    newStatus: "registered" | "attended" | "absent",
  ) => {
    // Optimistically update local state
    setRegistrations((prev) =>
      prev.map((reg) =>
        reg._id === regId ? { ...reg, status: newStatus } : reg,
      ),
    );

    try {
      const res = await fetch(`/api/events/${eventId}/attendance`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: regId, status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update attendance");
      }

      toast.success(
        newStatus === "attended"
          ? "Marked as attended"
          : newStatus === "absent"
            ? "Marked as absent"
            : "Marked as registered"
      );
    } catch (err: any) {
      toast.error(err.message || "Failed to update attendance");
      fetchRegistrations();
    }
  };

  const assignWinner = async (id: string, position: number) => {
    try {
      setLoadingId(`${id}-${position}`);
      const res = await fetch(`/api/events/${eventId}/winners`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId: id, position }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error);
        return;
      }

      toast.success(`Winner assigned for position ${position}`);
      fetchDetails();
    } catch (err: any) {
      toast.error("Failed to assign winner");
    } finally {
      setLoadingId(null);
    }
  };

  const unassignWinner = async (position: number) => {
    try {
      setLoadingId(`unassign-${position}`);
      const res = await fetch(`/api/events/${eventId}/winners?position=${position}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to unassign winner");
        return;
      }

      toast.success(`Winner unassigned from ${position === 1 ? '1st Place' : position === 2 ? '2nd Place' : '3rd Place'}`);
      if (openDropdownPos === position) {
        setOpenDropdownPos(null);
      }
      fetchDetails();
    } catch (err: any) {
      toast.error("Failed to unassign winner");
    } finally {
      setLoadingId(null);
    }
  };

  const downloadBillPDF = async () => {
    if (!billRef.current || !event) return;
    try {
      setDownloadingBill(true);
      toast.info("Generating bill, please wait...");

      // Create a temporary iframe to isolate the bill from main document styles (which contains Tailwind v4's oklch/lab colors that crash html2canvas)
      const iframe = document.createElement("iframe");
      iframe.style.position = "absolute";
      iframe.style.width = "800px";
      iframe.style.height = "1000px";
      iframe.style.left = "-9999px";
      iframe.style.top = "-9999px";
      document.body.appendChild(iframe);

      const iframeDoc =
        iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe document");

      // Render custom inline classes matching our utility classes
      iframeDoc.open();
      iframeDoc.write(`
        <html>
          <head>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                color: #1e293b;
                background: #ffffff;
                margin: 0;
                padding: 64px;
              }
              .flex { display: flex; }
              .justify-between { justify-content: space-between; }
              .items-start { align-items: flex-start; }
              .items-center { align-items: center; }
              .gap-3 { gap: 12px; }
              .gap-8 { gap: 32px; }
              .border-b { border-bottom: 1px solid #e2e8f0; }
              .border-slate-200 { border-color: #e2e8f0; }
              .border-slate-100 { border-color: #f1f5f9; }
              .pb-10 { padding-bottom: 40px; }
              .mb-1 { margin-bottom: 4px; }
              .mb-2 { margin-bottom: 8px; }
              .mb-8 { margin-bottom: 32px; }
              .mb-10 { margin-bottom: 40px; }
              .mb-12 { margin-bottom: 48px; }
              .mb-16 { margin-bottom: 64px; }
              .text-xl { font-size: 20px; }
              .text-lg { font-size: 18px; }
              .text-sm { font-size: 14px; }
              .text-xs { font-size: 12px; }
              .text-[11px] { font-size: 11px; }
              .font-bold { font-weight: 700; }
              .font-semibold { font-weight: 600; }
              .font-medium { font-weight: 500; }
              .tracking-widest { letter-spacing: 0.1em; }
              .tracking-wider { letter-spacing: 0.05em; }
              .uppercase { text-transform: uppercase; }
              .text-slate-900 { color: #0f172a; }
              .text-slate-800 { color: #1e293b; }
              .text-slate-600 { color: #475569; }
              .text-slate-500 { color: #64748b; }
              .text-slate-450 { color: #94a3b8; }
              .text-slate-400 { color: #94a3b8; }
              .text-rose-600 { color: #dc2626; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .grid { display: grid; }
              .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
              .mt-1 { margin-top: 4px; }
              .mt-0.5 { margin-top: 2px; }
              .pt-8 { padding-top: 32px; }
              .capitalize { text-transform: capitalize; }
              .w-full { width: 100%; }
              .w-80 { width: 320px; }
              .border-collapse { border-collapse: collapse; }
              .divide-y > * + * { border-top: 1px solid #f1f5f9; }
              .py-3 { padding-top: 12px; padding-bottom: 12px; }
              .py-4 { padding-top: 16px; padding-bottom: 16px; }
              .py-2 { padding-top: 8px; padding-bottom: 8px; }
              .pb-3 { padding-bottom: 12px; }
              .border-b.border-slate-900 { border-bottom: 1px solid #0f172a; }
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

      // Wait briefly for rendering to complete in the iframe context
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
      console.error("PDF Generation error details:", error);
      toast.error(`Failed to generate bill: ${error?.message || error}`);
    } finally {
      setDownloadingBill(false);
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
      const nameField =
        event.eventType === "team"
          ? reg.groupId?.name || "Unknown Team"
          : reg.userId?.name || "Unknown user";

      const emailField =
        event.eventType === "team"
          ? reg.groupId?.leader?.email || ""
          : reg.userId?.email || "";

      const membersField =
        event.eventType === "team"
          ? reg.groupId?.members?.map((m) => m.name).join("; ") || ""
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
        const ansObj = reg.customQuestionAnswers?.find(
          (ans) => ans.questionId === q.id,
        );
        const ansVal = ansObj
          ? Array.isArray(ansObj.answer)
            ? ansObj.answer.join("; ")
            : ansObj.answer
          : "";
        row.push(`"${ansVal.toString().replace(/"/g, '""')}"`);
      });

      csvRows.push(row.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${event.name.replace(/\s+/g, "_")}_participants.csv`,
    );
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

  const filteredMetrics = useMemo(() => {
    const now = new Date();
    let currentRegs = registrations;
    let previousRegs: RegistrationItem[] = [];
    let currentPayments = payments;
    let previousPayments: PaymentItem[] = [];

    if (timeFilter === "Today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      currentRegs = registrations.filter(
        (r) => new Date(r.registeredAt) >= today,
      );
      currentPayments = payments.filter((p) => new Date(p.createdAt) >= today);
      const yesterday = new Date(today.getTime() - 86400000);
      previousRegs = registrations.filter((r) => {
        const d = new Date(r.registeredAt);
        return d >= yesterday && d < today;
      });
      previousPayments = payments.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= yesterday && d < today;
      });
    } else if (timeFilter === "Last 7 Days") {
      const last7 = new Date(now.getTime() - 7 * 86400000);
      currentRegs = registrations.filter(
        (r) => new Date(r.registeredAt) >= last7,
      );
      currentPayments = payments.filter((p) => new Date(p.createdAt) >= last7);
      const last14 = new Date(now.getTime() - 14 * 86400000);
      previousRegs = registrations.filter((r) => {
        const d = new Date(r.registeredAt);
        return d >= last14 && d < last7;
      });
      previousPayments = payments.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= last14 && d < last7;
      });
    } else if (timeFilter === "This Month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      currentRegs = registrations.filter(
        (r) => new Date(r.registeredAt) >= startOfMonth,
      );
      currentPayments = payments.filter(
        (p) => new Date(p.createdAt) >= startOfMonth,
      );
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      previousRegs = registrations.filter((r) => {
        const d = new Date(r.registeredAt);
        return d >= startOfLastMonth && d < startOfMonth;
      });
      previousPayments = payments.filter((p) => {
        const d = new Date(p.createdAt);
        return d >= startOfLastMonth && d < startOfMonth;
      });
    }

    const currentStats = {
      registrations: currentRegs.length,
      revenue: currentPayments.reduce((acc, p) => acc + p.amount, 0),
    };

    const prevStats = {
      registrations: previousRegs.length,
      revenue: previousPayments.reduce((acc, p) => acc + p.amount, 0),
    };

    const calculateTrend = (current: number, prev: number) => {
      if (prev === 0)
        return current > 0 ? { value: 100, isPositive: true } : null;
      const pct = ((current - prev) / prev) * 100;
      return { value: Math.abs(Number(pct.toFixed(1))), isPositive: pct >= 0 };
    };

    return {
      current: currentStats,
      trends:
        timeFilter === "All Time"
          ? null
          : {
              registrations: calculateTrend(
                currentStats.registrations,
                prevStats.registrations,
              ),
              revenue: calculateTrend(currentStats.revenue, prevStats.revenue),
              label:
                timeFilter === "Today"
                  ? "from yesterday"
                  : timeFilter === "Last 7 Days"
                    ? "from previous 7 days"
                    : "from last month",
            },
    };
  }, [registrations, payments, timeFilter]);

  const getFeedbackRating = useCallback((fb: FeedbackItem): number => {
    if (typeof fb.rating === "number" && fb.rating > 0) return fb.rating;
    if (fb.answers && fb.answers.length > 0) {
      const validAnswers = fb.answers.filter((a) => typeof a.rating === "number" && a.rating > 0);
      if (validAnswers.length > 0) {
        const sum = validAnswers.reduce((acc, a) => acc + a.rating, 0);
        return sum / validAnswers.length;
      }
    }
    return 0;
  }, []);

  const ratingStats = useMemo(() => {
    if (feedbacks.length === 0)
      return { avg: "0.0", count: 0, stars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, questionStats: [] };
    
    const stars: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let sum = 0;
    let validCount = 0;
    const qStatsMap: Record<string, { total: number; count: number }> = {};

    feedbacks.forEach((fb) => {
      const r = getFeedbackRating(fb);
      if (r > 0) {
        const rounded = Math.min(5, Math.max(1, Math.round(r)));
        stars[rounded] = (stars[rounded] || 0) + 1;
        sum += r;
        validCount++;
      }

      if (fb.answers && fb.answers.length > 0) {
        fb.answers.forEach((ans) => {
          if (ans.questionId && typeof ans.rating === "number" && ans.rating > 0) {
            if (!qStatsMap[ans.questionId]) {
              qStatsMap[ans.questionId] = { total: 0, count: 0 };
            }
            qStatsMap[ans.questionId].total += ans.rating;
            qStatsMap[ans.questionId].count += 1;
          }
        });
      }
    });

    const questionStats = Object.keys(qStatsMap).map((qId) => ({
      questionId: qId,
      average: (qStatsMap[qId].total / qStatsMap[qId].count).toFixed(1),
      count: qStatsMap[qId].count,
    }));

    return {
      avg: validCount > 0 ? (sum / validCount).toFixed(1) : "0.0",
      count: validCount,
      stars,
      questionStats,
    };
  }, [feedbacks, getFeedbackRating]);

  const feedbackQuestionsMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (event?.feedbackForm && typeof event.feedbackForm === "object" && Array.isArray(event.feedbackForm.questions)) {
      event.feedbackForm.questions.forEach((q: any) => {
        if (q.id && q.text) map[q.id] = q.text;
      });
    }
    availableFeedbackForms.forEach((form: any) => {
      if (Array.isArray(form.questions)) {
        form.questions.forEach((q: any) => {
          if (q.id && q.text) map[q.id] = q.text;
        });
      }
    });
    feedbacks.forEach((fb) => {
      if (fb.feedbackFormId && typeof fb.feedbackFormId === "object" && Array.isArray(fb.feedbackFormId.questions)) {
        fb.feedbackFormId.questions.forEach((q: any) => {
          if (q.id && q.text) map[q.id] = q.text;
        });
      }
    });
    return map;
  }, [event?.feedbackForm, availableFeedbackForms, feedbacks]);

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

  const currentWinners = useMemo(() => {
    if (!event) return [];
    const winnersArr = (event.winners || [])
      .map((w: any) => {
        const pId =
          event.eventType === "team" 
            ? (w.group?._id || w.group)?.toString() 
            : (w.user?._id || w.user)?.toString();
        const participant = registrations.find((p) =>
          event.eventType === "team"
            ? p.groupId?._id === pId
            : p.userId?._id === pId,
        );
        return { participant, position: w.position };
      })
      .filter((w) => w.participant);

    // Legacy support (fallback for position 1)
    if (!winnersArr.some((w) => w.position === 1) && (event.winner || event.winnerGroup)) {
      const legacyId =
        event.eventType === "team" ? (event.winnerGroup?._id || event.winnerGroup)?.toString() : (event.winner?._id || event.winner)?.toString();
      const participant = registrations.find((p) =>
        event.eventType === "team"
          ? p.groupId?._id === legacyId
          : p.userId?._id === legacyId,
      );
      if (participant) winnersArr.push({ participant, position: 1 });
    }
    return winnersArr;
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
        x: {
          grid: { display: false },
          ticks: { color: "#999", font: { size: 10 } },
        },
        y: { display: false },
      },
    }),
    [],
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

  const pieOptions = useMemo(
    () => ({
      plugins: {
        legend: { display: false },
      },
      cutout: "70%",
      maintainAspectRatio: false,
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
  const conversionRate =
    event.views > 0
      ? ((registrations.length / event.views) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
      <button
        onClick={() => router.push("/club-admin/events")}
        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-650 transition-colors outline-none mb-6"
      >
        <ArrowLeft size={14} /> Back to Events
      </button>

      {/* Event Header Section with Image on the Left */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-stretch">
        {event.image && (
          <div className="w-full lg:w-80 shrink-0 rounded-xl overflow-hidden border border-slate-200 shadow-sm relative bg-slate-50 min-h-[220px]">
            <img
              src={event.image}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="flex-1 bg-white border border-slate-200 rounded-xl p-6 sm:p-8 shadow-sm flex flex-col justify-start gap-4">
          <div className="flex flex-col gap-3 flex-grow">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                {event.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-600 bg-slate-100/80 border border-slate-200 px-2 py-0.5 rounded uppercase tracking-wide">
                  {event.eventType === "team" ? "Team" : "Individual"} Format
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
                      />
                    )}
                    {event.superEvent.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex-grow min-h-0">
              <p
                className={`text-sm text-slate-500 font-medium leading-relaxed max-w-3xl ${!descExpanded ? "line-clamp-3 lg:line-clamp-8" : ""}`}
                title={event.description}
              >
                {event.description || "No description provided."}
              </p>
              {event.description && event.description.length > 250 && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="text-xs font-bold text-[#7CB342] hover:text-[#689F38] mt-1 inline-flex items-center gap-0.5 transition-colors outline-none"
                >
                  {descExpanded ? "Show Less" : "Read More"}
                </button>
              )}
            </div>

            {/* Minimal metadata info strip */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-3 text-xs text-slate-500 font-semibold border-t border-slate-100 mt-auto">
              <span className="flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                {eventDate.toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <IndianRupee size={13} className="text-slate-400" />
                {event.registrationFee > 0
                  ? event.registrationFee.toLocaleString()
                  : "Free Event"}
              </span>
              {event.maxRegistrations && (
                <span className="flex items-center gap-1.5">
                  <Users size={13} className="text-slate-400" />
                  {registrations.length} / {event.maxRegistrations} Registered
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap pt-2">
            <button
              onClick={downloadBillPDF}
              disabled={downloadingBill}
              className="px-4 py-2 text-sm font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              {downloadingBill ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Receipt size={14} />
              )}
              Download Bill
            </button>
            <button
              onClick={() => setEditDrawerOpen(true)}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <Pencil size={14} /> Edit Event
            </button>
            <Link
              href={`/club-admin/events/${eventId}/scan`}
              className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <QrCode size={14} /> Scan QR
            </Link>
            {event.status === "draft" && (
              <button
                onClick={() => handleStatusChange("live")}
                disabled={statusLoading}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {statusLoading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Publish Live
              </button>
            )}
            {event.status === "live" && (
              <button
                onClick={() => handleStatusChange("completed")}
                disabled={statusLoading}
                className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center gap-2"
              >
                {statusLoading && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Complete Event
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Insights Row */}
      {(event.eventType === "team" ||
        (event.customQuestions && event.customQuestions.length > 0) ||
        true) && (
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
                <h3 className="text-sm font-bold text-slate-800">
                  Demographics
                </h3>
              </div>
              <Link
                href={`/club-admin/events/${eventId}/demographics`}
                className="p-1 rounded hover:bg-slate-50 transition-colors text-slate-400 hover:text-[#00BCD4]"
              >
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="h-32 w-full relative">
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
                      className="flex items-center gap-1.5 min-w-0"
                    >
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor:
                            pieData.datasets[0].backgroundColor[i],
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
                Total: ₹{revenueChartData.total.toLocaleString()}
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
      )}

      <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-6 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Event Records
            </h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Manage participants, check attendance, and view reviews.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={downloadCSV}
              className="px-4 py-2.5 text-xs font-bold text-white bg-[#7CB342] border border-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <Download size={13} /> Export CSV
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
              {Boolean(
                typeof event.feedbackForm === "object"
                  ? event.feedbackForm?._id
                  : event.feedbackForm
              ) ? (
                `Feedbacks (${feedbacks.length})`
              ) : (
                <>
                  <Lock size={12} className="text-amber-500" />
                  Feedbacks
                </>
              )}
            </button>
            <button
              onClick={() => setActiveTab("certificates")}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-all outline-none shrink-0 flex items-center gap-2 cursor-pointer ${
                activeTab === "certificates"
                  ? "text-[#689F38] bg-white shadow-sm border border-[#c5d6a8]"
                  : "text-slate-500 hover:text-slate-700 hover:bg-white/50 border border-transparent"
              }`}
            >
              Certificates
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
          {activeTab === "participants" && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 sticky top-0 bg-white z-10">
                  <th className="py-3.5 pl-6 pr-4 font-bold text-slate-400 text-[10px] tracking-wider uppercase w-8">
                    <input
                      type="checkbox"
                      className="rounded border-slate-300 cursor-pointer"
                      disabled
                    />
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
                    Attendance
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
                  filteredRegistrations.map((reg) => {
                    return (
                      <tr
                        key={reg._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-4 pl-6 pr-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            className="rounded border-slate-300 cursor-pointer text-[#7CB342] focus:ring-[#7CB342]"
                          />
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
                                          <img
                                            src={m.image}
                                            alt=""
                                            className="h-full w-full object-cover"
                                          />
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
                                      <div
                                        className={`opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-150 bg-[#FAF6EE] text-slate-700 text-[10px] px-2 py-1 rounded border border-[#E8DFD0] absolute top-full mt-1.5 whitespace-nowrap z-50 shadow-sm font-semibold leading-none ${
                                          idx === 0
                                            ? "left-0 translate-x-0"
                                            : "left-1/2 -translate-x-1/2"
                                        }`}
                                      >
                                        {/* Creme arrow tail */}
                                        <div
                                          className={`absolute bottom-full w-0 h-0 border-4 border-transparent border-b-[#E8DFD0] ${
                                            idx === 0
                                              ? "left-3"
                                              : "left-1/2 -translate-x-1/2"
                                          }`}
                                        />
                                        <div
                                          className={`absolute bottom-full w-0 h-0 border-[3px] border-transparent border-b-[#FAF6EE] translate-y-[1px] ${
                                            idx === 0
                                              ? "left-[13px]"
                                              : "left-1/2 -translate-x-1/2"
                                          }`}
                                        />
                                        <span>{m.name}</span>
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

                        <td className="py-4 pl-4 pr-6 text-right">
                          <select
                            value={reg.status}
                            onChange={(e) =>
                              handleAttendanceChange(
                                reg._id,
                                e.target.value as any,
                              )
                            }
                            className={`px-3 py-1 text-[10px] font-bold rounded-full border outline-none cursor-pointer transition-colors shadow-sm ${
                              reg.status === "attended"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100/50"
                                : reg.status === "absent"
                                  ? "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100/50"
                                  : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            <option
                              value="registered"
                              className="bg-white text-slate-800 font-medium"
                            >
                              Registered
                            </option>
                            <option
                              value="attended"
                              className="bg-white text-slate-800 font-medium"
                            >
                              Attended
                            </option>
                            <option
                              value="absent"
                              className="bg-white text-slate-800 font-medium"
                            >
                              Absent
                            </option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}

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

          {activeTab === "feedback" && (() => {
            const hasForm = Boolean(
              typeof event.feedbackForm === "object"
                ? event.feedbackForm?._id
                : event.feedbackForm
            );
            const currentFormId =
              typeof event.feedbackForm === "object"
                ? event.feedbackForm?._id || ""
                : event.feedbackForm || "";
            const currentFormName =
              typeof event.feedbackForm === "object"
                ? event.feedbackForm?.name || "Feedback Form"
                : availableFeedbackForms.find((f) => f._id === event.feedbackForm)?.name ||
                  "Feedback Form";

            if (!hasForm) {
              return (
                <div className="p-8 sm:p-14 max-w-xl mx-auto flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-500 flex items-center justify-center mb-4 shadow-xs">
                    <Lock size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Feedbacks Tab is Locked
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">
                    Attach a feedback form to enable attendee ratings, question reviews, and analytics for this event.
                  </p>

                  <div className="w-full bg-slate-50/80 rounded-2xl p-6 border border-slate-200/80 shadow-sm text-left space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Select a Feedback Form
                      </label>
                      <select
                        value=""
                        onChange={(e) => {
                          if (e.target.value) {
                            updateEventCertificates({ feedbackForm: e.target.value });
                          }
                        }}
                        className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-[#7CB342] focus:ring-2 focus:ring-[#f0f7e6] transition-all cursor-pointer shadow-2xs"
                      >
                        <option value="">-- Choose a Feedback Form to Unlock --</option>
                        {availableFeedbackForms.map((form) => (
                          <option key={form._id} value={form._id}>
                            {form.name} ({form.questions?.length || 0} questions)
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-200/80 text-xs">
                      <span className="text-slate-500 font-medium">Need to create one first?</span>
                      <Link
                        href="/club-admin/feedback-forms"
                        className="text-[#689F38] hover:text-[#558B2F] font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Manage Feedback Forms →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <div className="p-6 space-y-6">
                {/* Form Selector & Status Banner */}
                <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl px-5 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#f0f7e6] text-[#558b2f] border border-[#dcedc8] flex items-center justify-center font-bold text-xs">
                      <FileText size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">
                          Active Form: {currentFormName}
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md border border-emerald-200">
                          Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                        Participants must submit this feedback form to unlock event certificates.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={currentFormId}
                      onChange={(e) => updateEventCertificates({ feedbackForm: e.target.value })}
                      className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-semibold focus:outline-none focus:border-[#7CB342] focus:ring-2 focus:ring-[#f0f7e6] transition-all cursor-pointer shadow-2xs"
                    >
                      {availableFeedbackForms.map((form) => (
                        <option key={form._id} value={form._id}>
                          {form.name}
                        </option>
                      ))}
                      <option value="">-- Remove Form (Lock Tab) --</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Star Rating Distribution & Analytics card */}
                  <div className="space-y-6">
                    <div className="bg-slate-50/70 rounded-3xl p-6 border border-slate-200/60 shadow-sm">
                      <h4 className="text-sm font-bold text-slate-800 mb-4">
                        Rating Breakdown
                      </h4>
                      
                      {/* Overall Average Display */}
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
                            Based on {feedbacks.length} {feedbacks.length === 1 ? "review" : "reviews"}
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
                                {rating} <Star size={10} className="text-amber-400 fill-amber-400" />
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

                    {/* Per-Question Averages (if available, expandable & closed by default) */}
                    {ratingStats.questionStats && ratingStats.questionStats.length > 0 && (
                      <div className="bg-slate-50/70 rounded-3xl p-5 border border-slate-200/60 shadow-sm transition-all">
                        <button
                          onClick={() => setQuestionAveragesExpanded((prev) => !prev)}
                          className="w-full flex items-center justify-between text-left group cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-800 group-hover:text-slate-900 transition-colors">
                              Question Averages
                            </h4>
                            <span className="px-2 py-0.5 bg-slate-200/70 text-slate-600 rounded-md text-[10px] font-bold">
                              {ratingStats.questionStats.length}
                            </span>
                          </div>
                          <div className="p-1 rounded-lg text-slate-400 group-hover:text-slate-700 group-hover:bg-slate-200/60 transition-colors">
                            {questionAveragesExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {questionAveragesExpanded && (
                          <div className="space-y-2.5 mt-4 pt-3 border-t border-slate-200/60 animate-in fade-in duration-200">
                            {ratingStats.questionStats.map((qs) => {
                              const qText = feedbackQuestionsMap[qs.questionId] || "Question";
                              return (
                                <div
                                  key={qs.questionId}
                                  className="bg-white p-3.5 rounded-2xl border border-slate-200/60 shadow-xs flex items-center justify-between gap-3"
                                >
                                  <p className="text-xs font-semibold text-slate-700 leading-snug line-clamp-2">
                                    {qText}
                                  </p>
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f0f7e6] text-[#558b2f] text-xs font-bold rounded-lg shrink-0 border border-[#dcedc8]">
                                    {qs.average} <Star size={10} className="fill-[#558b2f] text-[#558b2f]" />
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Feedbacks list */}
                  <div className="lg:col-span-2 space-y-4">
                    {feedbacks.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl font-semibold text-xs bg-white flex flex-col items-center justify-center p-8">
                        <MessageSquare className="w-10 h-10 text-slate-300 mb-3" />
                        <p className="text-slate-600 font-bold text-sm">No reviews submitted yet</p>
                        <p className="text-slate-400 text-xs mt-1">Participant feedback and ratings will appear here.</p>
                      </div>
                    ) : (
                      feedbacks.map((fb) => {
                        const avgRating = getFeedbackRating(fb);
                        const roundedRating = Math.round(avgRating);
                        const formattedDate = fb.createdAt
                          ? new Date(fb.createdAt).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : null;

                        const isExpanded = !!expandedFeedbacks[fb._id];

                        return (
                          <div
                            key={fb._id}
                            className="p-6 bg-white rounded-3xl border border-slate-200/60 shadow-sm hover:shadow transition-shadow space-y-4"
                          >
                            {/* Header: User Profile & Rating */}
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {fb.userId?.image ? (
                                  <img
                                    src={fb.userId.image}
                                    alt={fb.userId.name || "User"}
                                    className="w-10 h-10 rounded-full object-cover border border-slate-200"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-[#f0f7e6] text-[#558b2f] border border-[#dcedc8] flex items-center justify-center font-bold text-sm">
                                    {fb.userId?.name ? fb.userId.name.charAt(0).toUpperCase() : "U"}
                                  </div>
                                )}
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 text-sm">
                                      {fb.userId?.name || "Anonymous Student"}
                                    </span>
                                    {fb.userId?.department && (
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-semibold rounded-md border border-slate-200">
                                        {fb.userId.department}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-slate-400 font-normal mt-0.5">
                                    {fb.userId?.email && <span>{fb.userId.email}</span>}
                                    {fb.userId?.email && formattedDate && <span>•</span>}
                                    {formattedDate && <span>{formattedDate}</span>}
                                  </div>
                                </div>
                              </div>

                              {/* Overall Star Rating */}
                              <div className="flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/70 px-3 py-1.5 rounded-xl">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                      key={i}
                                      size={13}
                                      className={
                                        i <= roundedRating
                                          ? "text-amber-400 fill-amber-400"
                                          : "text-slate-200"
                                      }
                                    />
                                  ))}
                                </div>
                                <span className="font-bold text-amber-700 text-xs ml-1">
                                  {avgRating.toFixed(1)}
                                </span>
                              </div>
                            </div>

                            {/* Optional Comment */}
                            {fb.comment && (
                              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-slate-700 text-xs font-medium leading-relaxed">
                                "{fb.comment}"
                              </div>
                            )}

                            {/* Question by Question Ratings Breakdown (Expandable, Closed by default) */}
                            {fb.answers && fb.answers.length > 0 && (
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  onClick={() => toggleExpandFeedback(fb._id)}
                                  className="flex items-center justify-between w-full py-1 text-slate-500 hover:text-slate-800 transition-colors text-xs font-semibold group cursor-pointer"
                                >
                                  <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-800">
                                    Question Breakdown ({fb.answers.length})
                                  </span>
                                  <span className="flex items-center gap-1 text-xs font-medium text-slate-400 group-hover:text-slate-600">
                                    {isExpanded ? "Hide" : "Show details"}
                                    {isExpanded ? (
                                      <ChevronUp size={14} />
                                    ) : (
                                      <ChevronDown size={14} />
                                    )}
                                  </span>
                                </button>

                                {isExpanded && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-2 animate-in fade-in duration-200">
                                    {fb.answers.map((ans, idx) => {
                                      const qText = feedbackQuestionsMap[ans.questionId] || `Question ${idx + 1}`;
                                      return (
                                        <div
                                          key={ans.questionId || idx}
                                          className="p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/50 flex items-center justify-between gap-2"
                                        >
                                          <span className="text-xs font-medium text-slate-600 truncate">
                                            {qText}
                                          </span>
                                          <div className="flex items-center gap-1 shrink-0">
                                            <div className="flex items-center gap-0.5">
                                              {[1, 2, 3, 4, 5].map((s) => (
                                                <Star
                                                  key={s}
                                                  size={10}
                                                  className={
                                                    s <= ans.rating
                                                      ? "text-amber-400 fill-amber-400"
                                                      : "text-slate-200"
                                                  }
                                                />
                                              ))}
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700 ml-0.5">
                                              {ans.rating}/5
                                            </span>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {activeTab === "winners" && (
            <div className="p-6 sm:p-8 pb-8">
              <style>{`
                @keyframes spinBadge {
                  0% { transform: rotateY(0deg); }
                  100% { transform: rotateY(360deg); }
                }
                @keyframes badgeShine {
                  0% { transform: translateX(-150%) rotate(25deg); opacity: 0; }
                  15% { opacity: 0.85; }
                  35% { transform: translateX(150%) rotate(25deg); opacity: 0; }
                  100% { transform: translateX(150%) rotate(25deg); opacity: 0; }
                }
                @keyframes sparkleStar {
                  0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
                  20% { transform: scale(1.1) rotate(45deg); opacity: 1; filter: drop-shadow(0 0 3px rgba(255,255,255,0.9)); }
                  40% { transform: scale(0.6) rotate(90deg); opacity: 0.8; }
                  60% { transform: scale(0) rotate(135deg); opacity: 0; }
                }
              `}</style>
              <motion.div 
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex flex-col lg:flex-row items-end justify-center gap-8 lg:gap-12 max-w-7xl mx-auto px-2 sm:px-4 mt-2 sm:mt-4 min-h-[420px] relative"
              >
                {/* Left/Center: Podium */}
                <motion.div 
                  layout
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  className={`w-full flex items-end justify-center gap-2 sm:gap-6 ${
                    openDropdownPos !== null ? "flex-1 max-w-xl" : "max-w-xl mx-auto"
                  }`}
                >
                  {[2, 1, 3].map((pos) => {
                    if (pos > (event.numberOfWinners || 1)) return null;
                    const winner = currentWinners.find(
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
                        label: "1st Place",
                      };
                    if (pos === 2)
                      theme = {
                        color: "text-slate-400",
                        bg: "bg-slate-400",
                        lightBg: "bg-slate-50",
                        border: "border-slate-200",
                        label: "2nd Place",
                      };

                    const coinConfigs: Record<number, any> = {
                      1: {
                        edgeColor: "bg-[#b45309] border-[#92400e]",
                        frontColor: "border-amber-500 ring-amber-200/90 bg-gradient-to-tr from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_18px_rgba(245,158,11,0.6)]",
                        backColor: "border-amber-500 ring-amber-200/90 bg-gradient-to-bl from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_18px_rgba(245,158,11,0.6)]",
                        textColor: "text-amber-950",
                        icon: <Trophy className="text-amber-950 w-5 h-5 sm:w-6 sm:h-6 relative z-10" />,
                        label: "Winner",
                        delay: 0.4,
                      },
                      2: {
                        edgeColor: "bg-[#475569] border-[#334155]",
                        frontColor: "border-slate-300 ring-white/90 bg-gradient-to-tr from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_18px_rgba(203,213,225,0.7)]",
                        backColor: "border-slate-300 ring-white/90 bg-gradient-to-bl from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_18px_rgba(203,213,225,0.7)]",
                        textColor: "text-slate-900",
                        icon: <Award className="text-slate-900 w-5 h-5 sm:w-6 sm:h-6 relative z-10" />,
                        label: (event.numberOfWinners || 1) === 2 ? "Runner-up" : "2nd Place",
                        delay: 0.8,
                      },
                      3: {
                        edgeColor: "bg-[#9a3412] border-[#7c2d12]",
                        frontColor: "border-orange-500 ring-orange-200/90 bg-gradient-to-tr from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_18px_rgba(234,88,12,0.6)]",
                        backColor: "border-orange-500 ring-orange-200/90 bg-gradient-to-bl from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_18px_rgba(234,88,12,0.6)]",
                        textColor: "text-orange-950",
                        icon: <Award className="text-orange-950 w-5 h-5 sm:w-6 sm:h-6 relative z-10" />,
                        label: "3rd Place",
                        delay: 1.2,
                      },
                    };
                    const coin = coinConfigs[pos] || coinConfigs[1];

                    const height =
                      pos === 1 ? "h-[160px]" : pos === 2 ? "h-[120px]" : "h-[90px]";
                    const isOpen = openDropdownPos === pos;

                    return (
                      <div
                        key={pos}
                        className="flex flex-col items-center justify-end flex-1 max-w-[200px] relative pt-6 sm:pt-10"
                      >
                        {/* 3D Rotating Coin Badge Above Winner Slot */}
                        <div className="flex flex-col items-center justify-center [perspective:600px] mb-6 sm:mb-8 z-10">
                          <div
                            className="relative w-16 h-16 sm:w-20 sm:h-20 [transform-style:preserve-3d] animate-[spinBadge_4s_linear_infinite]"
                            style={{ animationDelay: `${coin.delay}s` }}
                          >
                            {/* Coin Thickness layers */}
                            {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((zOffset, i) => (
                              <div
                                key={i}
                                className={`absolute inset-0 rounded-full border-2 sm:border-[3px] ${coin.edgeColor}`}
                                style={{ transform: `translateZ(${zOffset}px)` }}
                              />
                            ))}

                            {/* Front Face */}
                            <div
                              className={`absolute inset-0 rounded-full border-2 sm:border-[3px] ring-1 sm:ring-2 ring-inset flex flex-col items-center justify-center p-1 sm:p-1.5 shadow-xl [backface-visibility:hidden] overflow-hidden ${coin.frontColor}`}
                              style={{ transform: "translateZ(3px)" }}
                            >
                              {coin.icon}
                              <span
                                className={`text-[7px] sm:text-[8.5px] font-black uppercase tracking-tight text-center leading-none mt-1 relative z-10 ${coin.textColor}`}
                              >
                                {coin.label}
                              </span>
                              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
                                <div
                                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px] animate-[badgeShine_2.5s_ease-in-out_infinite]"
                                  style={{ animationDelay: `${coin.delay}s` }}
                                />
                                {/* Sparkle Stars */}
                                <div 
                                  className="absolute top-1.5 right-2 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                                  style={{ animationDelay: `${coin.delay + 0.15}s` }}
                                >
                                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-white drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                  </svg>
                                </div>
                                <div 
                                  className="absolute bottom-1.5 left-2 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                                  style={{ animationDelay: `${coin.delay + 0.45}s` }}
                                >
                                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-white drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                  </svg>
                                </div>
                              </div>
                            </div>

                            {/* Back Face */}
                            <div
                              className={`absolute inset-0 rounded-full border-2 sm:border-[3px] ring-1 sm:ring-2 ring-inset flex flex-col items-center justify-center p-1 sm:p-2 shadow-xl [backface-visibility:hidden] overflow-hidden ${coin.backColor}`}
                              style={{ transform: "translateZ(-3px) rotateY(180deg)" }}
                            >
                              <span
                                className={`font-black uppercase text-[7px] sm:text-[8.5px] tracking-tight text-center line-clamp-2 leading-tight relative z-10 px-1 ${coin.textColor}`}
                              >
                                {event.name || "Winner"}
                              </span>
                              <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
                                <div
                                  className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px] animate-[badgeShine_2.5s_ease-in-out_infinite]"
                                  style={{ animationDelay: `${coin.delay + 1.25}s` }}
                                />
                                {/* Sparkle Stars Back */}
                                <div 
                                  className="absolute top-2 left-2 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                                  style={{ animationDelay: `${coin.delay + 1.4}s` }}
                                >
                                  <svg viewBox="0 0 24 24" className="w-3 h-3 text-white fill-white drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                  </svg>
                                </div>
                                <div 
                                  className="absolute bottom-2 right-2 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                                  style={{ animationDelay: `${coin.delay + 1.7}s` }}
                                >
                                  <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-white drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
                                    <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mb-4 w-full relative group/slot">
                          <button
                            onClick={() => setOpenDropdownPos(isOpen ? null : pos)}
                            className="w-full outline-none text-left relative cursor-pointer"
                          >
                            {winner ? (
                              <div
                                className={`relative p-3 rounded-lg border ${theme.border} ${theme.lightBg} shadow-sm text-center transform transition-transform hover:scale-105 flex flex-col items-center justify-center`}
                              >
                                {event.eventType === "team" ? (
                                  <div className="flex flex-col items-center justify-center space-y-2">
                                    <div className="flex -space-x-2 py-1 shrink-0">
                                      {winner.groupId?.members?.slice(0, 4).map((m: any) => (
                                        <div
                                          key={m._id}
                                          className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 relative group shrink-0"
                                        >
                                          <div className="w-full h-full rounded-full overflow-hidden">
                                            {m.image ? (
                                              <img src={m.image} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                              <div className="h-full w-full flex items-center justify-center text-[10px] font-black text-slate-450 uppercase">
                                                {m.name?.charAt(0)}
                                              </div>
                                            )}
                                          </div>
                                          {m._id === winner.groupId?.leader?._id && (
                                            <div className="absolute inset-0 border-2 border-amber-500 rounded-full" />
                                          )}
                                        </div>
                                      ))}
                                      {(winner.groupId?.members?.length || 0) > 4 && (
                                        <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 relative shrink-0 flex items-center justify-center text-[10px] font-bold text-slate-500">
                                          +{(winner.groupId?.members?.length || 0) - 4}
                                        </div>
                                      )}
                                    </div>
                                    <p className="font-bold text-slate-800 text-xs truncate max-w-[140px]" title={winner.groupId?.name}>
                                      {winner.groupId?.name}
                                    </p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="w-10 h-10 mx-auto rounded-full bg-white border border-slate-200 flex items-center justify-center overflow-hidden mb-2">
                                      {winner.userId?.image ? (
                                        <img src={winner.userId.image} className="w-full h-full object-cover" />
                                      ) : (
                                        <span className="font-bold text-slate-400 text-xs">{winner.userId?.name?.charAt(0)}</span>
                                      )}
                                    </div>
                                    <p className="font-bold text-slate-800 text-xs truncate max-w-[140px]" title={winner.userId?.name}>
                                      {winner.userId?.name}
                                    </p>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="px-2">
                                <div
                                  className={`p-3 rounded-lg border border-dashed ${
                                    isOpen ? theme.border : "border-slate-300"
                                  } ${
                                    isOpen ? theme.lightBg : "bg-slate-50"
                                  } text-center opacity-80 hover:opacity-100 transition-all`}
                                >
                                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    Assign...
                                  </span>
                                </div>
                              </div>
                            )}
                          </button>

                          {/* Quick Unassign X button */}
                          {winner && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                unassignWinner(pos);
                              }}
                              disabled={loadingId === `unassign-${pos}`}
                              className="absolute -top-2 -right-2 p-1 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-full border border-slate-200 shadow-sm transition-all opacity-0 group-hover/slot:opacity-100 cursor-pointer z-20 hover:scale-110"
                              title="Unassign winner"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>

                        <div
                          className={`w-full ${height} ${theme.bg} rounded-t-lg flex flex-col items-center pt-3 shadow-inner relative overflow-hidden pointer-events-none`}
                        >
                          <div className="absolute inset-0 bg-white/20" />
                          <span className="relative font-black text-white text-3xl opacity-90">
                            {pos}
                          </span>
                          <span className="relative text-[10px] font-bold text-white uppercase tracking-wider opacity-80 mt-1">
                            {theme.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </motion.div>

                {/* Right Side: Animated Assignment Table */}
                <AnimatePresence mode="wait">
                  {openDropdownPos !== null && (
                    <motion.div
                      key={`assignment-table-${openDropdownPos}`}
                      initial={{ opacity: 0, x: 30, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 0.96, transition: { duration: 0.15 } }}
                      transition={{ type: "spring", stiffness: 320, damping: 28 }}
                      className="flex-1 w-full flex flex-col justify-end h-auto max-w-2xl"
                    >
                      <div className="h-[420px] flex flex-col border border-slate-200 rounded-xl shadow-sm bg-white overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-slate-100 shrink-0 bg-slate-50/70">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              openDropdownPos === 1 ? 'bg-amber-500' : openDropdownPos === 2 ? 'bg-slate-400' : 'bg-orange-500'
                            }`} />
                            <h3 className="font-bold text-slate-800 text-sm">
                              Assign {openDropdownPos === 1 ? '1st Place' : openDropdownPos === 2 ? '2nd Place' : '3rd Place'}
                            </h3>
                          </div>
                          <div className="flex items-center gap-2">
                            {currentWinners.some((w) => w.position === openDropdownPos) && (
                              <button
                                onClick={() => unassignWinner(openDropdownPos)}
                                disabled={loadingId === `unassign-${openDropdownPos}`}
                                className="text-xs text-rose-600 hover:text-rose-700 font-semibold px-2.5 py-1 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors cursor-pointer"
                              >
                                Unassign
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setOpenDropdownPos(null);
                                setWinnerSearchQuery("");
                              }} 
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors border border-transparent cursor-pointer"
                              title="Close"
                              aria-label="Close"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Search Bar */}
                        <div className="p-2.5 border-b border-slate-100 bg-white shrink-0">
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input 
                              type="text"
                              placeholder={event.eventType === "team" ? "Search teams or members..." : "Search participants by name or email..."}
                              value={winnerSearchQuery}
                              onChange={(e) => setWinnerSearchQuery(e.target.value)}
                              className="w-full pl-9 pr-8 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all placeholder:text-slate-400"
                            />
                            {winnerSearchQuery && (
                              <button 
                                onClick={() => setWinnerSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                              >
                                <X size={12} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Table Content */}
                        <div className="flex-1 overflow-y-auto min-h-0 relative">
                          <table className="w-full text-left border-collapse absolute top-0 w-full">
                            <thead className="sticky top-0 z-10">
                              <tr className="bg-slate-50 border-b border-slate-100 shadow-2xs">
                                {event.eventType === "team" ? (
                                  <th className="py-2.5 px-6 font-bold text-slate-400 text-[10px] tracking-wider uppercase bg-slate-50">
                                    Team / Leader
                                  </th>
                                ) : (
                                  <th className="py-2.5 px-6 font-bold text-slate-400 text-[10px] tracking-wider uppercase bg-slate-50">
                                    Participant
                                  </th>
                                )}
                                <th className="py-2.5 px-6 font-bold text-slate-400 text-[10px] tracking-wider uppercase text-right bg-slate-50">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {(() => {
                                const filtered = registrations.filter(p => {
                                  const isAlreadyWinner = currentWinners.some((w) => w.participant._id === p._id);
                                  if (isAlreadyWinner) return false;
                                  const id = event.eventType === "team" ? p.groupId?._id : p.userId?._id;
                                  if (!id) return false;

                                  if (!winnerSearchQuery.trim()) return true;
                                  const q = winnerSearchQuery.toLowerCase();
                                  if (event.eventType === "team") {
                                    const teamName = p.groupId?.name?.toLowerCase() || "";
                                    const leaderName = p.groupId?.leader?.name?.toLowerCase() || "";
                                    const hasMember = p.groupId?.members?.some((m: any) => m.name?.toLowerCase().includes(q)) || false;
                                    return teamName.includes(q) || leaderName.includes(q) || hasMember;
                                  } else {
                                    const userName = p.userId?.name?.toLowerCase() || "";
                                    const userEmail = p.userId?.email?.toLowerCase() || "";
                                    return userName.includes(q) || userEmail.includes(q);
                                  }
                                });

                                if (filtered.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={2} className="py-12 text-center text-xs font-medium text-slate-400">
                                        {winnerSearchQuery.trim() ? `No results found for "${winnerSearchQuery}"` : "No participants available to assign"}
                                      </td>
                                    </tr>
                                  );
                                }

                                return filtered.map(p => {
                                  const id = event.eventType === "team" ? p.groupId?._id : p.userId?._id;
                                  const name = event.eventType === "team" ? p.groupId?.name : p.userId?.name;

                                  return (
                                    <tr key={p._id} className="hover:bg-slate-50/60 transition-colors group">
                                      <td className="py-3 px-6">
                                        {event.eventType === "team" ? (
                                          <div className="space-y-1.5 py-0.5">
                                            <div className="flex items-center gap-2">
                                              <p className="font-bold text-slate-800 text-xs sm:text-sm truncate max-w-[200px]">
                                                {p.groupId?.name || "Unknown Team"}
                                              </p>
                                              <span className="text-[9px] font-bold text-[#7CB342] bg-[#f0f7e6] border border-[#7CB342]/10 px-1.5 py-0.5 rounded-sm shrink-0">
                                                {p.groupId?.members?.length || 0} Members
                                              </span>
                                            </div>
                                            <div className="flex items-center">
                                              <div className="flex -space-x-2 py-0.5 shrink-0">
                                                {p.groupId?.members?.slice(0, 5).map((m: any) => (
                                                  <div
                                                    key={m._id}
                                                    className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 relative shrink-0"
                                                  >
                                                    <div className="w-full h-full rounded-full overflow-hidden">
                                                      {m.image ? (
                                                        <img src={m.image} alt="" className="h-full w-full object-cover" />
                                                      ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-[9px] font-black text-slate-450 uppercase">
                                                          {m.name?.charAt(0)}
                                                        </div>
                                                      )}
                                                    </div>
                                                    {m._id === p.groupId?.leader?._id && (
                                                      <div className="absolute inset-0 border border-[#7CB342] rounded-full" />
                                                    )}
                                                  </div>
                                                ))}
                                                {(p.groupId?.members?.length || 0) > 5 && (
                                                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-100 relative shrink-0 flex items-center justify-center text-[9px] font-bold text-slate-500">
                                                    +{(p.groupId?.members?.length || 0) - 5}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                                              {p.userId?.image ? (
                                                <img src={p.userId.image} alt="" className="w-full h-full object-cover" />
                                              ) : (
                                                <span className="font-bold text-slate-400 text-xs">
                                                  {(name || "?")?.charAt(0)}
                                                </span>
                                              )}
                                            </div>
                                            <div>
                                              <p className="font-bold text-slate-800 text-sm">{name}</p>
                                              <p className="text-[10px] text-slate-500 mt-0.5">{p.userId?.email}</p>
                                            </div>
                                          </div>
                                        )}
                                      </td>
                                      <td className="py-3 px-6 text-right">
                                        <button
                                          onClick={() => {
                                            assignWinner(id, openDropdownPos);
                                            setOpenDropdownPos(null);
                                            setWinnerSearchQuery("");
                                          }}
                                          disabled={loadingId !== null}
                                          className="px-4 py-2 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 rounded-lg transition-all shadow-2xs opacity-0 group-hover:opacity-100 focus:opacity-100 cursor-pointer"
                                        >
                                          Assign
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                });
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
          {activeTab === "certificates" && (() => {
            const numWinners = event.numberOfWinners || 1;
            
            const participationCertId =
              typeof event.certificatesByPosition?.participation === "object"
                ? event.certificatesByPosition?.participation?._id || ""
                : event.certificatesByPosition?.participation ||
                  (typeof event.certificate === "object"
                    ? event.certificate?._id || ""
                    : event.certificate || "");

            const participationCert =
              availableCertificates.find((c) => c._id === participationCertId) ||
              (typeof event.certificate === "object" && event.certificate?._id === participationCertId
                ? event.certificate
                : typeof event.certificatesByPosition?.participation === "object"
                ? event.certificatesByPosition.participation
                : null);

            const firstCertId =
              typeof event.certificatesByPosition?.first === "object"
                ? event.certificatesByPosition?.first?._id || ""
                : event.certificatesByPosition?.first || "";
            const firstCert =
              availableCertificates.find((c) => c._id === firstCertId) ||
              (typeof event.certificatesByPosition?.first === "object" ? event.certificatesByPosition.first : null);

            const secondCertId =
              typeof event.certificatesByPosition?.second === "object"
                ? event.certificatesByPosition?.second?._id || ""
                : event.certificatesByPosition?.second || "";
            const secondCert =
              availableCertificates.find((c) => c._id === secondCertId) ||
              (typeof event.certificatesByPosition?.second === "object" ? event.certificatesByPosition.second : null);

            const thirdCertId =
              typeof event.certificatesByPosition?.third === "object"
                ? event.certificatesByPosition?.third?._id || ""
                : event.certificatesByPosition?.third || "";
            const thirdCert =
              availableCertificates.find((c) => c._id === thirdCertId) ||
              (typeof event.certificatesByPosition?.third === "object" ? event.certificatesByPosition.third : null);

            const tiers = [
              {
                key: "participation",
                coinDelay: 0,
                coin: {
                  edgeColor: "bg-[#4d7c0f] border-[#365314]",
                  frontColor: "border-[#84cc16] ring-[#d9f99d]/90 bg-gradient-to-tr from-[#65a30d] via-[#ecfccb] to-[#4d7c0f] shadow-[0_0_14px_rgba(132,204,22,0.45)]",
                  backColor: "border-[#84cc16] ring-[#d9f99d]/90 bg-gradient-to-bl from-[#65a30d] via-[#ecfccb] to-[#4d7c0f] shadow-[0_0_14px_rgba(132,204,22,0.45)]",
                  textColor: "text-[#14532d]",
                  icon: <Award className="text-[#14532d] w-4 h-4 relative z-10" />,
                  label: "Participant",
                },
                title: "Participant Certificate",
                subtitle: "Awarded to all participants who attend",
                value: participationCertId,
                selectedCert: participationCert,
                inheritedCert: null,
                isBase: true,
                onChange: (val: string) =>
                  updateEventCertificates({
                    certificate: val,
                    "certificatesByPosition.participation": val,
                  }),
              },
              {
                key: "first",
                coinDelay: 0.4,
                coin: {
                  edgeColor: "bg-[#b45309] border-[#92400e]",
                  frontColor: "border-amber-500 ring-amber-200/90 bg-gradient-to-tr from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_14px_rgba(245,158,11,0.55)]",
                  backColor: "border-amber-500 ring-amber-200/90 bg-gradient-to-bl from-[#f59e0b] via-[#fef08a] to-[#d97706] shadow-[0_0_14px_rgba(245,158,11,0.55)]",
                  textColor: "text-amber-950",
                  icon: <Trophy className="text-amber-950 w-4 h-4 relative z-10" />,
                  label: "Winner",
                },
                title: "Winner Certificate",
                subtitle: "Awarded to event champion",
                value: firstCertId,
                selectedCert: firstCert,
                inheritedCert: participationCert,
                isBase: false,
                onChange: (val: string) =>
                  updateEventCertificates({ "certificatesByPosition.first": val }),
              },
              ...(numWinners >= 2
                ? [
                    {
                      key: "second",
                      coinDelay: 0.8,
                      coin: {
                        edgeColor: "bg-[#475569] border-[#334155]",
                        frontColor: "border-slate-300 ring-white/90 bg-gradient-to-tr from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_14px_rgba(203,213,225,0.65)]",
                        backColor: "border-slate-300 ring-white/90 bg-gradient-to-bl from-[#94a3b8] via-[#ffffff] to-[#64748b] shadow-[0_0_14px_rgba(203,213,225,0.65)]",
                        textColor: "text-slate-900",
                        icon: <Award className="text-slate-900 w-4 h-4 relative z-10" />,
                        label: numWinners === 2 ? "Runner-up" : "2nd Place",
                      },
                      title: numWinners === 2 ? "Runner Up" : "2nd Place Certificate",
                      subtitle: "Awarded to 2nd position winner",
                      value: secondCertId,
                      selectedCert: secondCert,
                      inheritedCert: participationCert,
                      isBase: false,
                      onChange: (val: string) =>
                        updateEventCertificates({ "certificatesByPosition.second": val }),
                    },
                  ]
                : []),
              ...(numWinners >= 3
                ? [
                    {
                      key: "third",
                      coinDelay: 1.2,
                      coin: {
                        edgeColor: "bg-[#9a3412] border-[#7c2d12]",
                        frontColor: "border-orange-500 ring-orange-200/90 bg-gradient-to-tr from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_14px_rgba(234,88,12,0.55)]",
                        backColor: "border-orange-500 ring-orange-200/90 bg-gradient-to-bl from-[#ea580c] via-[#fed7aa] to-[#c2410c] shadow-[0_0_14px_rgba(234,88,12,0.55)]",
                        textColor: "text-orange-950",
                        icon: <Award className="text-orange-950 w-4 h-4 relative z-10" />,
                        label: "3rd Place",
                      },
                      title: "3rd Place Certificate",
                      subtitle: "Awarded to 3rd position winner",
                      value: thirdCertId,
                      selectedCert: thirdCert,
                      inheritedCert: participationCert,
                      isBase: false,
                      onChange: (val: string) =>
                        updateEventCertificates({ "certificatesByPosition.third": val }),
                    },
                  ]
                : []),
            ];

            const gridClass =
              tiers.length === 2
                ? "grid-cols-1 md:grid-cols-2 max-w-3xl mx-auto"
                : tiers.length === 3
                ? "grid-cols-1 md:grid-cols-3"
                : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";

            return (
              <div className="p-6 sm:p-8 space-y-6">
                <style>{`
                  @keyframes spinBadge {
                    0% { transform: rotateY(0deg); }
                    100% { transform: rotateY(360deg); }
                  }
                  @keyframes badgeShine {
                    0% { transform: translateX(-150%) rotate(25deg); opacity: 0; }
                    15% { opacity: 0.85; }
                    35% { transform: translateX(150%) rotate(25deg); opacity: 0; }
                    100% { transform: translateX(150%) rotate(25deg); opacity: 0; }
                  }
                  @keyframes sparkleStar {
                    0%, 100% { transform: scale(0) rotate(0deg); opacity: 0; }
                    20% { transform: scale(1.1) rotate(45deg); opacity: 1; filter: drop-shadow(0 0 3px rgba(255,255,255,0.9)); }
                    40% { transform: scale(0.6) rotate(90deg); opacity: 0.8; }
                    60% { transform: scale(0) rotate(135deg); opacity: 0; }
                  }
                `}</style>

                {/* Dynamic Columns Grid with Coin Badges on Top */}
                <div className={`grid ${gridClass} gap-6 items-start`}>
                  {tiers.map((tier) => {
                    const displayCert = tier.selectedCert || (!tier.isBase ? tier.inheritedCert : null);
                    const isInherited = !tier.selectedCert && !tier.isBase && !!tier.inheritedCert;
                    const isDropdownOpen = activeCertDropdownTier === tier.key;

                    return (
                      <div key={tier.key} className="flex flex-col items-center w-full">
                        {/* 1. Rotating 3D Coin Badge on Top */}
                        <div className="flex flex-col items-center justify-center [perspective:600px] mb-3 z-10">
                          <div
                            className="relative w-14 h-14 sm:w-16 sm:h-16 [transform-style:preserve-3d] animate-[spinBadge_4s_linear_infinite]"
                            style={{ animationDelay: `${tier.coinDelay}s` }}
                          >
                            {/* Coin Thickness layers */}
                            {[-2, -1.2, -0.4, 0.4, 1.2, 2].map((zOffset, i) => (
                              <div
                                key={i}
                                className={`absolute inset-0 rounded-full border-2 ${tier.coin.edgeColor}`}
                                style={{ transform: `translateZ(${zOffset}px)` }}
                              />
                            ))}

                            {/* Front Face */}
                            <div
                              className={`absolute inset-0 rounded-full border-2 ring-1 ring-inset flex flex-col items-center justify-center p-1 shadow-lg [backface-visibility:hidden] overflow-hidden ${tier.coin.frontColor}`}
                              style={{ transform: "translateZ(2.5px)" }}
                            >
                              {tier.coin.icon}
                              <span
                                className={`text-[6.5px] sm:text-[7.5px] font-black uppercase tracking-tight text-center leading-tight mt-0.5 relative z-10 ${tier.coin.textColor}`}
                              >
                                {tier.coin.label}
                              </span>
                              {!tier.isBase && (
                                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
                                  <div
                                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px] animate-[badgeShine_2.5s_ease-in-out_infinite]"
                                    style={{ animationDelay: `${tier.coinDelay}s` }}
                                  />
                                  {/* Sparkle Stars */}
                                  <div 
                                    className="absolute top-1 right-1.5 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                                    style={{ animationDelay: `${tier.coinDelay + 0.15}s` }}
                                  >
                                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-white drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
                                      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                    </svg>
                                  </div>
                                  <div 
                                    className="absolute bottom-1 left-1.5 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                                    style={{ animationDelay: `${tier.coinDelay + 0.45}s` }}
                                  >
                                    <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-white drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
                                      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Back Face */}
                            <div
                              className={`absolute inset-0 rounded-full border-2 ring-1 ring-inset flex flex-col items-center justify-center p-1 shadow-lg [backface-visibility:hidden] overflow-hidden ${tier.coin.backColor}`}
                              style={{ transform: "translateZ(-2.5px) rotateY(180deg)" }}
                            >
                              <span
                                className={`font-black uppercase text-[6.5px] sm:text-[7.5px] tracking-tight text-center line-clamp-2 leading-tight relative z-10 px-1 ${tier.coin.textColor}`}
                              >
                                {event.name || "Event"}
                              </span>
                              {!tier.isBase && (
                                <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden rounded-full">
                                  <div
                                    className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-[1px] animate-[badgeShine_2.5s_ease-in-out_infinite]"
                                    style={{ animationDelay: `${tier.coinDelay + 1.25}s` }}
                                  />
                                  {/* Sparkle Stars Back */}
                                  <div 
                                    className="absolute top-1.5 left-1.5 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                                    style={{ animationDelay: `${tier.coinDelay + 1.4}s` }}
                                  >
                                    <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 text-white fill-white drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
                                      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                    </svg>
                                  </div>
                                  <div 
                                    className="absolute bottom-1 right-1.5 animate-[sparkleStar_2.5s_ease-in-out_infinite]"
                                    style={{ animationDelay: `${tier.coinDelay + 1.7}s` }}
                                  >
                                    <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-white drop-shadow-[0_0_2px_rgba(255,255,255,0.9)]">
                                      <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
                                    </svg>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* 2. Card Container below Coin */}
                        <div className="w-full bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 flex flex-col justify-between space-y-3 hover:shadow-md transition-shadow relative">
                          {/* Tier Title and Subtitle */}
                          <div>
                            <h4 className="text-sm font-bold text-slate-800">
                              {tier.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 font-medium leading-tight mt-0.5">
                              {tier.subtitle}
                            </p>
                          </div>

                          {/* Certificate Thumbnail Box with Hover Actions */}
                          <div className="relative">
                            <div className="aspect-[16/11] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 relative flex items-center justify-center group shadow-2xs">
                              {displayCert?.url ? (
                                <>
                                  <img
                                    src={displayCert.url}
                                    alt={displayCert.name || "Certificate Template"}
                                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-102 ${
                                      isInherited ? "opacity-75 grayscale-[15%]" : ""
                                    }`}
                                  />
                                  
                                  {/* Hover Overlay with Action Buttons on Top */}
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2.5">
                                    {/* Top Bar with Name & Template Dropdown + Delete */}
                                    <div className="flex items-center justify-between gap-1.5 w-full">
                                      {/* Dropdown Button with Name */}
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setActiveCertDropdownTier(isDropdownOpen ? null : tier.key);
                                        }}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white text-slate-800 text-[11px] font-bold shadow-md transition-all hover:scale-102 cursor-pointer max-w-[80%] min-w-0"
                                        title="Change Certificate Template"
                                      >
                                        <span className="truncate">{displayCert.name}</span>
                                        <ChevronDown size={12} className="text-slate-500 shrink-0" />
                                      </button>

                                      {/* Delete Button */}
                                      {Boolean(tier.value) && (
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            tier.onChange("");
                                          }}
                                          className="p-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white shadow-md transition-transform hover:scale-105 cursor-pointer shrink-0"
                                          title="Remove Certificate"
                                        >
                                          <Trash2 size={12} />
                                        </button>
                                      )}
                                    </div>

                                    {/* Bottom area intentionally left clean without extra badges */}
                                    <div />
                                  </div>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActiveCertDropdownTier(isDropdownOpen ? null : tier.key)}
                                  className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-slate-400 space-y-1.5 hover:bg-slate-100/70 transition-colors cursor-pointer"
                                >
                                  <Award size={24} className="text-slate-300" />
                                  <span className="text-xs font-bold text-slate-600">
                                    No Certificate Assigned
                                  </span>
                                  <span className="text-[10px] text-slate-400 font-medium leading-tight">
                                    Click to select a template
                                  </span>
                                </button>
                              )}
                            </div>

                            {/* Dropdown Menu Overlay inside the thumbnail container */}
                            <AnimatePresence>
                              {isDropdownOpen && (
                                <>
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setActiveCertDropdownTier(null)}
                                  />
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute inset-0 z-50 bg-white/98 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-2.5 flex flex-col"
                                  >
                                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 shrink-0">
                                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                                        Select Template
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() => setActiveCertDropdownTier(null)}
                                        className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                                      >
                                        <X size={13} />
                                      </button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto space-y-1 pr-0.5">
                                      {/* Default Option (No Certificate / Inherit Participant Certificate) */}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          tier.onChange("");
                                          setActiveCertDropdownTier(null);
                                        }}
                                        className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                          !tier.value
                                            ? "bg-[#f0f7e6] text-[#558B2F]"
                                            : "hover:bg-slate-50 text-slate-700"
                                        }`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <div className="w-8 h-5.5 rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                                            <X size={11} />
                                          </div>
                                          <span className="text-xs font-bold truncate">
                                            {tier.isBase ? "No Certificate" : "Inherit Participant Certificate"}
                                          </span>
                                        </div>
                                        {!tier.value && (
                                          <CheckCircle2 size={13} className="text-[#7CB342] shrink-0" />
                                        )}
                                      </button>

                                      {/* Available Certificates */}
                                      {availableCertificates.map((cert) => {
                                        const isSelected = tier.value === cert._id;
                                        return (
                                          <button
                                            key={cert._id}
                                            type="button"
                                            onClick={() => {
                                              tier.onChange(cert._id);
                                              setActiveCertDropdownTier(null);
                                            }}
                                            className={`w-full p-2 rounded-xl text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                                              isSelected
                                                ? "bg-[#f0f7e6] text-[#558B2F]"
                                                : "hover:bg-slate-50 text-slate-700"
                                            }`}
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                              <div className="w-9 h-6 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                {cert.url ? (
                                                  <img
                                                    src={cert.url}
                                                    alt=""
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                    <Award size={11} />
                                                  </div>
                                                )}
                                              </div>
                                              <span className="text-xs font-bold text-slate-800 truncate">
                                                {cert.name}
                                              </span>
                                            </div>
                                            {isSelected && (
                                              <CheckCircle2 size={13} className="text-[#7CB342] shrink-0" />
                                            )}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </motion.div>
                                </>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Audience Likes & Admirers Section */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden mb-8 p-6">
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
                className="p-3.5 bg-slate-50/50 hover:bg-white rounded-xl border border-slate-200/60 shadow-xs flex items-center gap-3 hover:shadow-sm transition-all"
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

      {/* Edit Drawer Integration */}
      {editDrawerOpen && event && (
        <CreateEditDrawer
          open={editDrawerOpen}
          editEvent={event as any}
          onClose={() => setEditDrawerOpen(false)}
          onSuccess={fetchDetails}
        />
      )}

      {/* ── Hidden Bill – renders off-screen, cloned into iframe for PDF ── */}
      <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
        <div
          ref={billRef}
          style={{
            width: "794px",
            background: "#ffffff",
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            color: "#0f172a",
            fontSize: "13px",
            lineHeight: "1.6",
          }}
        >
          {/* Main content */}
          <div style={{ padding: "52px 60px 60px" }}>
            {/* ── HEADER ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "52px",
              }}
            >
              {/* Brand */}
              <div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "850",
                    color: "#0f172a",
                    letterSpacing: "-0.3px",
                    lineHeight: "1.1",
                  }}
                >
                  Clubly
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "600",
                    color: "#94a3b8",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginTop: "6px",
                  }}
                >
                  Event Management Platform
                </div>
              </div>

              {/* Invoice meta */}
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "850",
                    color: "#0f172a",
                    letterSpacing: "-0.5px",
                    marginBottom: "6px",
                  }}
                >
                  Settlement Statement
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "500",
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>Ref. </span>#ST-
                  {event._id.slice(-6).toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748b",
                    fontWeight: "500",
                    marginTop: "2px",
                  }}
                >
                  <span style={{ color: "#94a3b8" }}>Issued </span>
                  {new Date().toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            {/* ── DIVIDER ── */}
            <div
              style={{
                height: "1px",
                background: "#e2e8f0",
                marginBottom: "40px",
              }}
            />

            {/* ── EVENT DETAILS BAND ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "44px",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#94a3b8",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "10px",
                  }}
                >
                  Event
                </div>
                <div
                  style={{
                    fontSize: "20px",
                    fontWeight: "850",
                    color: "#0f172a",
                    letterSpacing: "-0.3px",
                    marginBottom: "5px",
                  }}
                >
                  {event.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "500",
                  }}
                >
                  <span>
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      weekday: "short",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                  <span style={{ color: "#cbd5e1" }}>·</span>
                  <span style={{ textTransform: "capitalize" }}>
                    {event.eventType} Format
                  </span>
                  <span style={{ color: "#cbd5e1" }}>·</span>
                  <span>{registrations.length} Registrations</span>
                </div>
              </div>
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "12px 20px 18px",
                  textAlign: "center",
                  minWidth: "120px",
                }}
              >
                <div
                  style={{
                    fontSize: "10px",
                    fontWeight: "700",
                    color: "#94a3b8",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  Ticket Price
                </div>
                <div
                  style={{
                    fontSize: "22px",
                    fontWeight: "850",
                    color: "#0f172a",
                    letterSpacing: "-0.5px",
                  }}
                >
                  ₹{event.registrationFee.toLocaleString()}
                </div>
              </div>
            </div>

            {/* ── LEDGER TABLE ── */}
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "0",
              }}
            >
              <thead>
                <tr style={{ borderBottom: "1.5px solid #0f172a" }}>
                  <th
                    style={{
                      padding: "0 0 12px 0",
                      textAlign: "left",
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#94a3b8",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Description
                  </th>
                  <th
                    style={{
                      padding: "0 0 12px 0",
                      textAlign: "center",
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#94a3b8",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Qty
                  </th>
                  <th
                    style={{
                      padding: "0 0 12px 0",
                      textAlign: "center",
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#94a3b8",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Unit Price
                  </th>
                  <th
                    style={{
                      padding: "0 0 12px 0",
                      textAlign: "right",
                      fontSize: "10px",
                      fontWeight: "700",
                      color: "#94a3b8",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "18px 0" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f172a",
                        marginBottom: "3px",
                      }}
                    >
                      Event Registration Tickets
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: "500",
                      }}
                    >
                      Paid registrations via Clubly portal
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "18px 0",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    {registrations.length}
                  </td>
                  <td
                    style={{
                      padding: "18px 0",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    ₹{event.registrationFee.toLocaleString()}
                  </td>
                  <td
                    style={{
                      padding: "18px 0",
                      textAlign: "right",
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    ₹
                    {(
                      event.registrationFee * registrations.length
                    ).toLocaleString()}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "18px 0" }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: "600",
                        color: "#0f172a",
                        marginBottom: "3px",
                      }}
                    >
                      Razorpay Payment Gateway Fee
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#94a3b8",
                        fontWeight: "500",
                      }}
                    >
                      Standard platform processing fee
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "18px 0",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    —
                  </td>
                  <td
                    style={{
                      padding: "18px 0",
                      textAlign: "center",
                      fontSize: "13px",
                      fontWeight: "600",
                      color: "#334155",
                    }}
                  >
                    2.0%
                  </td>
                  <td
                    style={{
                      padding: "18px 0",
                      textAlign: "right",
                      fontSize: "14px",
                      fontWeight: "700",
                      color: "#0f172a",
                    }}
                  >
                    − ₹
                    {Math.round(
                      event.registrationFee * registrations.length * 0.02,
                    ).toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* ── TOTAL BLOCK ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "32px",
                marginBottom: "52px",
              }}
            >
              <div style={{ width: "300px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "500",
                    padding: "7px 0",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <span>Gross Revenue</span>
                  <span>
                    ₹
                    {(
                      event.registrationFee * registrations.length
                    ).toLocaleString()}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12px",
                    color: "#64748b",
                    fontWeight: "500",
                    padding: "7px 0",
                  }}
                >
                  <span>Gateway Fee (2%)</span>
                  <span>
                    − ₹
                    {Math.round(
                      event.registrationFee * registrations.length * 0.02,
                    ).toLocaleString()}
                  </span>
                </div>
                {/* Net payout highlight - double top border for clean alignment */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "2px solid #0f172a",
                    paddingTop: "16px",
                    marginTop: "10px",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        color: "#0f172a",
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                      }}
                    >
                      Net Settlement
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        fontWeight: "500",
                        marginTop: "2px",
                      }}
                    >
                      After all deductions
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: "24px",
                      fontWeight: "850",
                      color: "#0f172a",
                      letterSpacing: "-0.5px",
                    }}
                  >
                    ₹
                    {Math.round(
                      event.registrationFee * registrations.length * 0.98,
                    ).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            {/* ── DIVIDER ── */}
            <div
              style={{
                height: "1px",
                background: "#e2e8f0",
                marginBottom: "24px",
              }}
            />

            {/* ── FOOTER ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontSize: "11px",
                  color: "#cbd5e1",
                  fontWeight: "500",
                }}
              >
                Computer generated. No signature required.
              </span>
            </div>
          </div>
        </div>
      </div>
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
      formData.append(
        "status",
        asDraft ? "draft" : editEvent?.status || "live",
      );

      if (eventType === "team") {
        if (teamSizeMin && teamSizeMax) {
          formData.append("teamSizeRange[min]", teamSizeMin);
          formData.append("teamSizeRange[max]", teamSizeMax);
        } else if (teamSize) {
          formData.append("teamSize", teamSize);
        }
      }
      if (prize) formData.append("prize", prize);
      if (maxRegistrations)
        formData.append("maxRegistrations", maxRegistrations);
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
            <p className="text-xs text-slate-400 mt-0.5">Step {step} of 3</p>
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
                        providesCertificate
                          ? "translate-x-4"
                          : "translate-x-0.5"
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
