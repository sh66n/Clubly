"use client";
import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useRouter } from "next/navigation";
import { useAcademicYear } from "@/context/AcademicYearContext";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Calendar,
  Users,
  IndianRupee,
  Eye,
  Heart,
  MoreVertical,
  Pencil,
  Trash2,
  Rocket,
  CheckCircle2,
  FileText,
  X,
  ChevronRight,
  Upload,
  Clock,
  Award,
  MessageSquare,
  Star,
  BarChart3,
  Loader2,
  AlertTriangle,
  Link2,
  CircleDot,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

/* ═══════════════════════════════════════════
   Types
   ═══════════════════════════════════════════ */
type EventStatus = "draft" | "live" | "completed";
type EventType = "team" | "individual";
type TabKey = "all" | "live" | "draft" | "completed";

interface CustomQuestion {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect";
  required: boolean;
  options?: string[];
}

interface EventItem {
  _id: string;
  name: string;
  description?: string;
  date: string;
  eventType: EventType;
  status: EventStatus;
  image?: string;
  registrationFee: number;
  maxRegistrations?: number;
  isRegistrationOpen: boolean;
  providesCertificate: boolean;
  registrationCount: number;
  revenue: number;
  views: number;
  likes: number;
  feedbackCount: number;
  avgRating: number;
  teamSize?: number;
  teamSizeRange?: { min: number; max: number };
  prize?: number;
  whatsappGroupLink?: string;
  customQuestions?: CustomQuestion[];
  certificateTemplate?: { url: string; publicId: string };
  createdAt: string;
  updatedAt: string;
}

interface DashboardStats {
  totalEvents: number;
  liveEvents: number;
  draftEvents: number;
  completedEvents: number;
  totalRegistrations: number;
  totalRevenue: number;
}

interface FeedbackItem {
  _id: string;
  rating: number;
  comment?: string;
  userId: { _id: string; name: string; image?: string };
  createdAt: string;
}

/* ═══════════════════════════════════════════
   Status Badge
   ═══════════════════════════════════════════ */
function InfoTooltip({ text }: { text: string }) {
  return (
    <div className="group relative inline-flex items-center justify-center w-4 h-4 rounded-full border border-slate-500 text-slate-400 text-[10px] font-bold cursor-help ml-2 shrink-0">
      i
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-40 bg-[#FFFEEA] border border-slate-400 text-slate-800 text-[10px] p-2 rounded-lg shadow-md z-50 font-medium text-center leading-normal">
        {text}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#FFFEEA]"></div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: EventStatus }) {
  const config = {
    draft: {
      label: "Draft",
      bg: "bg-slate-100",
      text: "text-slate-600",
    },
    live: {
      label: "Live",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    completed: {
      label: "Completed",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
  };
  const s = config[status] || config.draft;
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2.5 py-0.5 rounded-full ${s.bg} ${s.text}`}
    >
      {s.label}
    </span>
  );
}

function RatingStars({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={
            i <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-slate-200"
          }
        />
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   Event Card Component
   ═══════════════════════════════════════════ */
function EventListCard({
  event,
  onEdit,
  onDelete,
  onStatusChange,
  onViewDetail,
}: {
  event: EventItem;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: EventStatus) => void;
  onViewDetail: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const eventDate = new Date(event.date);

  return (
    <tr className="group hover:bg-[#f0f7e6]/50 transition-colors border-b border-slate-100 last:border-0 relative">
      <td className="py-4 pl-6 pr-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-slate-300 text-[#7CB342] focus:ring-[#7CB342] cursor-pointer"
            onClick={(e) => e.stopPropagation()}
          />
          <span className="text-slate-500 font-medium text-sm">
            #{event._id.slice(-8)}
          </span>
        </div>
      </td>
      <td
        className="px-4 py-4 whitespace-nowrap min-w-[200px] cursor-pointer"
        onClick={onViewDetail}
      >
        <div className="flex items-center gap-3">
          {event.image ? (
            <div className="w-9 h-9 rounded-md overflow-hidden shrink-0 border border-slate-200/50">
              <img
                src={event.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-md bg-[#f0f7e6] flex items-center justify-center shrink-0 text-[#7CB342] border border-[#c5d6a8]">
              <Calendar size={14} />
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-800 hover:text-[#7CB342] transition-colors">
              {event.name}
            </span>
            {event.description && (
              <p
                className="text-xs text-slate-500 truncate w-48"
                title={event.description}
              >
                {event.description}
              </p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
        <span className="capitalize">{event.eventType}</span>
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">
        {eventDate.toLocaleDateString("en-US", {
          month: "numeric",
          day: "numeric",
          year: "2-digit",
        })}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-800 font-semibold">
        {event.registrationFee > 0 ? `₹${event.registrationFee}` : "Free"}
      </td>
      <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-emerald-600">
        ₹{event.revenue.toLocaleString()}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <StatusBadge status={event.status} />
      </td>
      <td className="py-4 pl-4 pr-6 whitespace-nowrap text-right">
        <div className="relative inline-block text-left" ref={menuRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <MoreVertical size={16} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -5 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="absolute right-0 top-9 z-30 bg-white border border-slate-200 shadow-xl rounded-xl py-1.5 min-w-[180px] overflow-hidden"
              >
                <button
                  onClick={() => {
                    onViewDetail();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#f0f7e6] hover:text-[#7CB342] transition-colors"
                >
                  <Eye size={14} /> View details
                </button>
                <button
                  onClick={() => {
                    onEdit();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-[#f0f7e6] hover:text-[#7CB342] transition-colors"
                >
                  <Pencil size={14} /> Edit details
                </button>
                {event.status === "draft" && (
                  <button
                    onClick={() => {
                      onStatusChange("live");
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                  >
                    <Rocket size={14} /> Publish event
                  </button>
                )}
                {event.status === "live" && (
                  <button
                    onClick={() => {
                      onStatusChange("completed");
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 text-left px-4 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    <CheckCircle2 size={14} /> Mark completed
                  </button>
                )}
                <hr className="my-1.5 border-slate-100" />
                <button
                  onClick={() => {
                    onDelete();
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 text-left px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={14} /> Delete event
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </td>
    </tr>
  );
}

/* ═══════════════════════════════════════════
   Create & Edit Event Drawer
   ═══════════════════════════════════════════ */
function CreateEditDrawer({
  open,
  editEvent,
  onClose,
  onSuccess,
}: {
  open: boolean;
  editEvent: EventItem | null;
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
    } else if (open) {
      setName("");
      setDescription("");
      setDate("");
      setTime("10:00");
      setEventType("individual");
      setTeamSize("");
      setTeamSizeMin("");
      setTeamSizeMax("");
      setRegistrationFee("0");
      setPrize("");
      setMaxRegistrations("");
      setWhatsappLink("");
      setProvidesCertificate(false);
      setImageFile(null);
      setImagePreview(null);
      setCertFile(null);
      setCertPreview(null);
      setCustomQuestions([]);
    }
    setStep(1);
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
      formData.append("status", asDraft ? "draft" : "live");

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

      const url = isEdit
        ? `/api/club-admin/events/${editEvent._id}`
        : "/api/club-admin/events";

      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save event");
      }

      toast.success(
        isEdit
          ? "Event updated successfully"
          : asDraft
            ? "Saved draft successfully"
            : "Event published successfully",
      );
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
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full z-10 border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              {isEdit ? "Edit event details" : "Create new event"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
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
                s <= step ? "bg-slate-700" : "bg-slate-100"
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
                    className="w-full h-24 border border-dashed border-slate-200 hover:border-slate-350 rounded-lg flex flex-col items-center justify-center text-slate-400 hover:text-slate-600 transition-colors gap-1 text-xs"
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
                  <Link2 size={14} className="text-slate-300" />
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
                        className="w-full py-4 border border-dashed border-slate-200 hover:border-slate-350 bg-white rounded flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-slate-600 text-[11px]"
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
                          className="absolute top-2 right-2 text-slate-300 hover:text-red-500"
                        >
                          ✕
                        </button>
                        <input
                          value={q.question}
                          onChange={(e) =>
                            updateQuestion(idx, { question: e.target.value })
                          }
                          placeholder="Label (e.g. Food Preference)"
                          className="w-[90%] px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg mb-2 focus:border-slate-450 outline-none text-slate-800"
                        />
                        <div className="flex items-center gap-3">
                          <select
                            value={q.type}
                            onChange={(e) =>
                              updateQuestion(idx, {
                                type: e.target.value as any,
                              })
                            }
                            className="px-2 py-1 text-xs bg-white border border-slate-200 rounded text-slate-600 outline-none"
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
                            className="w-full mt-2 px-2.5 py-1.5 text-xs border border-slate-200 rounded outline-none focus:border-slate-450 text-slate-700"
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
              className="px-4 py-2 text-xs font-semibold text-slate-500 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            {!isEdit && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                Save Draft
              </button>
            )}
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
                {isEdit ? "Save Changes" : "Publish Event"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Event Details Side Slider Panel
   ═══════════════════════════════════════════ */
function EventDetailPanel({
  event,
  onClose,
  onEdit,
  onStatusChange,
}: {
  event: EventItem | null;
  onClose: () => void;
  onEdit: () => void;
  onStatusChange: (status: EventStatus) => void;
}) {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [avgRating, setAvgRating] = useState(0);
  const [ratingDist, setRatingDist] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!event) return;
    setFeedbackLoading(true);
    fetch(`/api/club-admin/events/${event._id}/feedback`)
      .then((r) => r.json())
      .then((data) => {
        setFeedback(data.feedback || []);
        setAvgRating(data.averageRating || 0);
        setRatingDist(data.ratingDistribution || {});
      })
      .catch(() => {})
      .finally(() => setFeedbackLoading(false));
  }, [event?._id]);

  if (!event) return null;

  const eventDate = new Date(event.date);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white shadow-xl flex flex-col h-full z-10 border-l border-slate-200">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">Event details</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {event.image && (
            <div className="w-full h-36 relative bg-slate-50 border-b border-slate-100">
              <img
                src={event.image}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                  {event.eventType}
                </span>
                <StatusBadge status={event.status} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 leading-snug">
                {event.name}
              </h3>
              {event.description && (
                <p className="text-xs text-slate-400 mt-2 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onEdit}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
              >
                Edit Event
              </button>
              {event.status === "draft" && (
                <button
                  onClick={() => onStatusChange("live")}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-900 rounded-lg transition-colors"
                >
                  Publish live
                </button>
              )}
              {event.status === "live" && (
                <button
                  onClick={() => onStatusChange("completed")}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                >
                  Complete event
                </button>
              )}
            </div>

            <hr className="border-slate-100" />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Date
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">
                  {eventDate.toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Time
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">
                  {eventDate.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Registration fee
                </span>
                <span className="text-xs font-bold text-slate-700 block mt-0.5">
                  {event.registrationFee > 0
                    ? `₹${event.registrationFee}`
                    : "Free"}
                </span>
              </div>
              {event.prize && (
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Prize pool
                  </span>
                  <span className="text-xs font-bold text-slate-700 block mt-0.5">
                    ₹{event.prize.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* Performance Stats */}
            <div className="bg-slate-50 border border-slate-150 rounded-xl p-4">
              <h4 className="text-xs font-bold text-slate-700 mb-3 flex items-center gap-1.5">
                <BarChart3 size={14} /> Performance metrics
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white border border-slate-100 rounded-lg p-2">
                  <span className="text-base font-bold text-slate-700 block">
                    {event.registrationCount}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Signups
                  </span>
                </div>
                <div className="bg-white border border-slate-100 rounded-lg p-2">
                  <span className="text-base font-bold text-slate-700 block">
                    {event.views}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Views
                  </span>
                </div>
                <div className="bg-white border border-slate-100 rounded-lg p-2">
                  <span className="text-base font-bold text-slate-700 block">
                    ₹{event.revenue.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Revenue
                  </span>
                </div>
              </div>
            </div>

            {/* Certificates */}
            {event.providesCertificate && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 mb-2">
                  Certificate Layout
                </h4>
                {event.certificateTemplate?.url ? (
                  <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-50 p-2">
                    <img
                      src={event.certificateTemplate.url}
                      alt=""
                      className="w-full h-24 object-contain"
                    />
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">
                    No certificate template uploaded.
                  </p>
                )}
              </div>
            )}

            {/* Feedback */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-slate-500">
                User Reviews ({event.feedbackCount})
              </h4>

              {feedbackLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                </div>
              ) : feedback.length === 0 ? (
                <p className="text-xs text-slate-400">
                  No feedback answered yet.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-3.5 border border-slate-150">
                    <div className="text-center shrink-0">
                      <p className="text-2xl font-bold text-slate-700">
                        {avgRating.toFixed(1)}
                      </p>
                      <RatingStars rating={avgRating} size={10} />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = ratingDist[stars] || 0;
                        const pct =
                          feedback.length > 0
                            ? (count / feedback.length) * 100
                            : 0;
                        return (
                          <div
                            key={stars}
                            className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400"
                          >
                            <span className="w-2.5">{stars}★</span>
                            <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-slate-500 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="w-4 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {feedback.slice(0, 3).map((fb) => (
                      <div
                        key={fb._id}
                        className="p-3 bg-slate-50/50 rounded-lg border border-slate-100 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-700">
                            {fb.userId.name}
                          </span>
                          <RatingStars rating={fb.rating} size={9} />
                        </div>
                        {fb.comment && (
                          <p className="text-slate-500 mt-1">{fb.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   Main Club Admin Dashboard Page
   ═══════════════════════════════════════════ */
export default function ClubAdminEventsPage() {
  const router = useRouter();
  const { academicYear, setAvailableYears } = useAcademicYear();

  const [events, setEvents] = useState<EventItem[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEvent, setEditEvent] = useState<EventItem | null>(null);
  const [detailEvent, setDetailEvent] = useState<EventItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EventItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [timeFilter, setTimeFilter] = useState("All Time");
  const [timeFilterOpen, setTimeFilterOpen] = useState(false);

  const fetchEvents = useCallback(async () => {
    if (!academicYear) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/club-admin/events?academicYear=${academicYear}`,
      );
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to fetch events");
      }
      const data = await res.json();
      setEvents(data.events || []);
      setStats(data.stats || null);
      if (data.availableAcademicYears) {
        setAvailableYears(data.availableAcademicYears);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [academicYear]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const filteredEvents = useMemo(() => {
    let filtered = events;

    if (activeTab !== "all") {
      filtered = filtered.filter((e) => e.status === activeTab);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(q));
    }

    return filtered;
  }, [events, activeTab, searchQuery]);

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredEvents.slice(start, start + itemsPerPage);
  }, [filteredEvents, currentPage, itemsPerPage]);

  // Reset page when search or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeTab]);

  const filteredStats = useMemo(() => {
    const now = new Date();
    let currentPeriodEvents = events;
    let previousPeriodEvents: EventItem[] = [];

    if (timeFilter === "Today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      currentPeriodEvents = events.filter(
        (e) => new Date(e.createdAt) >= today,
      );
      const yesterday = new Date(today.getTime() - 86400000);
      previousPeriodEvents = events.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= yesterday && d < today;
      });
    } else if (timeFilter === "Last 7 Days") {
      const last7 = new Date(now.getTime() - 7 * 86400000);
      currentPeriodEvents = events.filter(
        (e) => new Date(e.createdAt) >= last7,
      );
      const last14 = new Date(now.getTime() - 14 * 86400000);
      previousPeriodEvents = events.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= last14 && d < last7;
      });
    } else if (timeFilter === "This Month") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      currentPeriodEvents = events.filter(
        (e) => new Date(e.createdAt) >= startOfMonth,
      );
      const startOfLastMonth = new Date(
        now.getFullYear(),
        now.getMonth() - 1,
        1,
      );
      previousPeriodEvents = events.filter((e) => {
        const d = new Date(e.createdAt);
        return d >= startOfLastMonth && d < startOfMonth;
      });
    }

    const currentStats = {
      revenue: currentPeriodEvents.reduce(
        (acc, e) => acc + (e.revenue || 0),
        0,
      ),
      events: currentPeriodEvents.length,
      registrations: currentPeriodEvents.reduce(
        (acc, e) => acc + (e.registrationCount || 0),
        0,
      ),
    };

    const prevStats = {
      revenue: previousPeriodEvents.reduce(
        (acc, e) => acc + (e.revenue || 0),
        0,
      ),
      events: previousPeriodEvents.length,
      registrations: previousPeriodEvents.reduce(
        (acc, e) => acc + (e.registrationCount || 0),
        0,
      ),
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
              revenue: calculateTrend(currentStats.revenue, prevStats.revenue),
              events: calculateTrend(currentStats.events, prevStats.events),
              registrations: calculateTrend(
                currentStats.registrations,
                prevStats.registrations,
              ),
              label:
                timeFilter === "Today"
                  ? "from yesterday"
                  : timeFilter === "Last 7 Days"
                    ? "from previous 7 days"
                    : "from last month",
            },
    };
  }, [events, timeFilter]);

  const handleStatusChange = async (
    eventId: string,
    newStatus: EventStatus,
  ) => {
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
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/club-admin/events/${deleteTarget._id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Failed to delete event");
      }
      toast.success("Event deleted successfully");
      setDeleteTarget(null);
      fetchEvents();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: "all", label: "All Events", count: stats?.totalEvents },
    { key: "live", label: "Live", count: stats?.liveEvents },
    { key: "draft", label: "Drafts", count: stats?.draftEvents },
    { key: "completed", label: "Completed", count: stats?.completedEvents },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <ClublyLoader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center max-w-sm mx-auto mt-10">
        <AlertTriangle size={24} className="text-slate-400 mx-auto mb-2" />
        <p className="font-bold text-slate-800 text-sm">Failed to connect</p>
        <p className="text-xs text-slate-400 mt-1">{error}</p>
        <button
          onClick={fetchEvents}
          className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-semibold hover:bg-slate-900 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Events Overview
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Manage and analyze your club&apos;s events and registrations in
            real-time.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center gap-2">
            <Upload size={14} /> Export
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all shadow-sm flex items-center gap-2">
            More Actions <ChevronRight size={14} className="rotate-90" />
          </button>
        </div>
      </div>

      <div
        className="border border-[#2d5c0c] text-white rounded-2xl shadow-md flex flex-col lg:flex-row mb-8 relative"
        style={{
          background:
            "radial-gradient(ellipse 1250px 100px at bottom right, #254f0a 0%, #040c00 100%)",
        }}
      >
        {/* Grain Overlay */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.95] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.95' numOctaves='4' result='noise'/%3E%3CfeColorMatrix type='matrix' values='0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1.5 -0.2'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='3.2' intercept='-1.0'/%3E%3CfeFuncG type='linear' slope='3.2' intercept='-1.0'/%3E%3CfeFuncB type='linear' slope='3.2' intercept='-1.0'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
        <div
          onClick={() => setTimeFilterOpen(!timeFilterOpen)}
          className="relative flex items-center justify-center p-6 lg:w-56 shrink-0 border-b lg:border-b-0 lg:border-r border-[#224b0a] cursor-pointer bg-[#132c02]/20 hover:bg-[#132c02]/50 transition-colors duration-200 rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl z-10"
        >
          <button className="flex items-center gap-2 outline-none">
            <Calendar size={22} className="text-[#9ccc65]" strokeWidth={2.5} />
            <span className="font-bold text-[#9ccc65] text-lg tracking-tight flex items-center gap-1">
              {timeFilter} <ChevronDown size={14} className="opacity-75" />
            </span>
          </button>

          {timeFilterOpen && (
            <div className="absolute top-full mt-2 bg-white rounded-xl shadow-lg border border-slate-100 p-1.5 w-40 z-50 text-slate-800">
              {["Today", "Last 7 Days", "This Month", "All Time"].map((opt) => (
                <button
                  key={opt}
                  onClick={(e) => {
                    e.stopPropagation();
                    setTimeFilter(opt);
                    setTimeFilterOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    timeFilter === opt
                      ? "bg-[#f0f7e6] text-[#7CB342]"
                      : "text-slate-650 hover:bg-slate-50"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#224b0a]">
          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#9ccc65]">
                Total Revenue
              </span>
              <InfoTooltip text="Total revenue generated from all events." />
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className="text-4xl font-bold text-white tracking-tight">
                ₹{filteredStats.current.revenue.toLocaleString()}
              </span>
              {filteredStats.trends && filteredStats.trends.revenue && (
                <div className="flex flex-col items-end">
                  <span
                    className={`text-xs font-bold flex items-center gap-1 ${filteredStats.trends.revenue.isPositive ? "text-[#5c8bff]" : "text-[#f25c5c]"}`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={
                        filteredStats.trends.revenue.isPositive
                          ? ""
                          : "rotate-180"
                      }
                    >
                      <path d="M3 3v18h18" />
                      <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                    </svg>
                    {filteredStats.trends.revenue.value}%
                  </span>
                  <span className="text-[10px] font-medium text-slate-350 mt-0.5">
                    {filteredStats.trends.label}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#9ccc65]">
                Total Events
              </span>
              <InfoTooltip text="Total number of events created." />
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className="text-4xl font-bold text-white tracking-tight">
                {stats.totalEvents}
              </span>
            </div>
          </div>

          <div className="flex flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-semibold text-[#9ccc65]">
                Registrations
              </span>
              <InfoTooltip text="Total registrations across all events." />
            </div>
            <div className="flex items-end justify-between mt-auto">
              <span className="text-4xl font-bold text-white tracking-tight">
                {stats.totalRegistrations.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs and Search bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Event Summary</h2>
            <p className="text-sm text-slate-500 mt-1">
              Overview of total events, registrations, and revenue.
            </p>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search box */}
            <div className="flex items-center bg-white border border-slate-200 focus-within:border-[#7CB342] focus-within:ring-2 focus-within:ring-[#f0f7e6] rounded-xl px-3.5 py-2 gap-2 w-full sm:w-64 transition-all shadow-sm">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none w-full font-medium"
              />
            </div>

            <button
              onClick={() => {
                setEditEvent(null);
                setDrawerOpen(true);
              }}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#7CB342] border border-[#7CB342] hover:bg-[#689F38] rounded-xl transition-all shadow-sm shadow-sm flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={14} /> New Event
            </button>
          </div>
        </div>

        {/* Sub Header for tabs */}
        <div className="px-6 py-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-4">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all outline-none shrink-0 flex items-center gap-2 ${
                  activeTab === tab.key
                    ? "text-[#689F38] bg-[#e2f1cd] shadow-sm border border-[#c5d6a8]"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-100 border border-transparent"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* List items block */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f0f7e6]/30 border-b border-slate-100">
                <th className="py-3 pl-6 pr-4 font-semibold text-slate-500 text-xs w-8">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 cursor-pointer"
                    disabled
                  />
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Event
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Format
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Date
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Fee
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Revenue
                </th>
                <th className="py-3 px-4 font-semibold text-slate-500 text-xs">
                  Status
                </th>
                <th className="py-3 pl-4 pr-6 font-semibold text-slate-500 text-xs text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400">
                    <p className="text-xs font-semibold">No events found</p>
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((event) => (
                  <EventListCard
                    key={event._id}
                    event={event}
                    onEdit={() => {
                      setEditEvent(event);
                      setDrawerOpen(true);
                    }}
                    onDelete={() => setDeleteTarget(event)}
                    onStatusChange={(status) =>
                      handleStatusChange(event._id, status)
                    }
                    onViewDetail={() =>
                      router.push(`/club-admin/events/${event._id}`)
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-white">
          <span className="text-xs text-slate-500 font-medium flex items-center gap-2">
            Items per page
            <select
              className="border border-slate-200 rounded-md p-1 outline-none text-slate-700 bg-slate-50"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 text-xs font-semibold text-slate-400 hover:text-slate-700 disabled:opacity-50"
            >
              {"<"} Previous
            </button>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum = currentPage;
              if (totalPages <= 5) pageNum = i + 1;
              else if (currentPage <= 3) pageNum = i + 1;
              else if (currentPage >= totalPages - 2)
                pageNum = totalPages - 4 + i;
              else pageNum = currentPage - 2 + i;

              return (
                <button
                  key={i}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                    currentPage === pageNum
                      ? "bg-[#7CB342] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="px-2 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 disabled:opacity-50"
            >
              Next {">"}
            </button>
          </div>
        </div>
      </div>

      {/* Drawers */}
      <AnimatePresence>
        {drawerOpen && (
          <CreateEditDrawer
            open={drawerOpen}
            editEvent={editEvent}
            onClose={() => {
              setDrawerOpen(false);
              setEditEvent(null);
            }}
            onSuccess={fetchEvents}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {detailEvent && (
          <EventDetailPanel
            event={detailEvent}
            onClose={() => setDetailEvent(null)}
            onEdit={() => {
              setEditEvent(detailEvent);
              setDetailEvent(null);
              setDrawerOpen(true);
            }}
            onStatusChange={(status) => {
              handleStatusChange(detailEvent._id, status);
              setDetailEvent(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Confirm Delete Dialog */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete event?"
        description={`Confirming will remove "${deleteTarget?.name}" completely. This action is irreversible.`}
        confirmLabel="Confirm"
        danger
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  danger,
  loading,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[1px]"
        onClick={onCancel}
      />
      <div className="relative bg-white rounded-xl shadow-xl p-5 max-w-xs w-full z-10 border border-slate-200">
        <h3 className="text-sm font-bold text-slate-800 text-center">
          {title}
        </h3>
        <p className="text-xs text-slate-400 text-center mt-1.5 leading-normal">
          {description}
        </p>
        <div className="flex gap-2.5 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 text-xs font-semibold text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-2 text-xs font-semibold text-white rounded-lg transition-colors flex items-center justify-center gap-1 ${
              danger
                ? "bg-[#f0f7e6]0 hover:bg-[#7CB342]"
                : "bg-slate-800 hover:bg-slate-900"
            }`}
          >
            {loading && <Loader2 size={10} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
