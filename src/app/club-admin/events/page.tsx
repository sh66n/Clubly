"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
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
    <div className="bg-white border border-slate-200/60 rounded-xl p-5 hover:border-slate-300 transition-colors duration-150">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Banner */}
        {event.image ? (
          <div
            className="w-full sm:w-36 h-24 rounded-lg overflow-hidden shrink-0 cursor-pointer bg-slate-50 border border-slate-100"
            onClick={onViewDetail}
          >
            <img
              src={event.image}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div
            className="w-full sm:w-36 h-24 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 cursor-pointer border border-slate-100 text-slate-300"
            onClick={onViewDetail}
          >
            <Calendar size={24} />
          </div>
        )}

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 px-1.5 py-0.5 rounded">
                  {event.eventType}
                </span>
                <StatusBadge status={event.status} />
                {event.providesCertificate && (
                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    Certificate
                  </span>
                )}
              </div>
              <h3
                className="text-base font-bold text-slate-800 hover:text-slate-900 cursor-pointer transition-colors"
                onClick={onViewDetail}
              >
                {event.name}
              </h3>
              {event.description && (
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                  {event.description}
                </p>
              )}
            </div>

            {/* Menu */}
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <MoreVertical size={16} />
              </button>
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.1 }}
                    className="absolute right-0 top-9 z-30 bg-white border border-slate-200 shadow-lg rounded-lg py-1 min-w-[160px]"
                  >
                    <button
                      onClick={() => {
                        onViewDetail();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      View details
                    </button>
                    <button
                      onClick={() => {
                        onEdit();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Edit details
                    </button>
                    {event.status === "draft" && (
                      <button
                        onClick={() => {
                          onStatusChange("live");
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-emerald-600 hover:bg-emerald-50"
                      >
                        Publish event
                      </button>
                    )}
                    {event.status === "live" && (
                      <button
                        onClick={() => {
                          onStatusChange("completed");
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        Mark completed
                      </button>
                    )}
                    <hr className="my-1 border-slate-100" />
                    <button
                      onClick={() => {
                        onDelete();
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50"
                    >
                      Delete event
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Calendar size={13} />
              {eventDate.toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock size={13} />
              {eventDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
            {event.registrationFee > 0 ? (
              <span className="flex items-center gap-0.5 text-slate-500 font-semibold">
                Entry: ₹{event.registrationFee}
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">Free entry</span>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-5 mt-4 pt-3.5 border-t border-slate-100 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Users size={13} className="text-slate-400" />
              <strong className="text-slate-600 font-semibold">
                {event.registrationCount}
              </strong>{" "}
              registered
            </span>
            <span className="flex items-center gap-1.5">
              <Eye size={13} />
              <strong className="text-slate-600 font-semibold">
                {event.views}
              </strong>{" "}
              views
            </span>
            {event.feedbackCount > 0 && (
              <span className="flex items-center gap-1.5">
                <MessageSquare size={13} />
                <strong className="text-slate-600 font-semibold">
                  {event.feedbackCount}
                </strong>{" "}
                reviews ({event.avgRating.toFixed(1)}★)
              </span>
            )}
            {event.revenue > 0 && (
              <span className="ml-auto text-xs font-semibold text-slate-600">
                Revenue: ₹{event.revenue.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
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
      if (maxRegistrations) formData.append("maxRegistrations", maxRegistrations);
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
            <p className="text-xs text-slate-400 mt-0.5">
              Step {step} of 3
            </p>
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
  const [academicYear, setAcademicYear] = useState<string>("");
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // Default to current academic year on mount
  useEffect(() => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // July is 6
    const defaultAcadYear = currentMonth >= 6 
      ? `${currentYear}-${currentYear + 1}` 
      : `${currentYear - 1}-${currentYear}`;
    setAcademicYear(defaultAcadYear);
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!academicYear) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/club-admin/events?academicYear=${academicYear}`);
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

  const handleStatusChange = async (eventId: string, newStatus: EventStatus) => {
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between gap-4">
        {/* Highlight Card */}
        {stats && events.length > 0 ? (
          <div className="text-xs text-slate-400 font-medium hidden sm:flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200/50">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7CB342]" />
            <span>Top event by signups: </span>
            <strong className="text-slate-700 font-bold">
              {(() => {
                const sorted = [...events].sort((a, b) => b.registrationCount - a.registrationCount);
                return sorted[0]?.name || "None";
              })()}
            </strong>
          </div>
        ) : (
          <div />
        )}
        <button
          onClick={() => {
            setEditEvent(null);
            setDrawerOpen(true);
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#7CB342] hover:bg-[#689F38] rounded-lg transition-colors outline-none shrink-0"
        >
          <Plus size={14} />
          Create Event
        </button>
      </div>

      {/* Numerical Stats overview */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200/60 rounded-xl p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total events
            </span>
            <span className="text-xl font-bold text-slate-800 block mt-0.5">
              {stats.totalEvents}
            </span>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-xl p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Live events
            </span>
            <span className="text-xl font-bold text-slate-800 block mt-0.5">
              {stats.liveEvents}
            </span>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-xl p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Registrations
            </span>
            <span className="text-xl font-bold text-slate-800 block mt-0.5">
              {stats.totalRegistrations.toLocaleString()}
            </span>
          </div>
          <div className="bg-white border border-slate-200/60 rounded-xl p-4">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Event Revenue
            </span>
            <span className="text-xl font-bold text-slate-800 block mt-0.5">
              ₹{stats.totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Tabs and Search bar */}
      <div className="bg-white border border-slate-200/65 rounded-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 border-b border-slate-100">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors outline-none shrink-0 ${
                  activeTab === tab.key
                    ? "text-slate-800 bg-slate-100"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="ml-1 text-[9px] font-bold text-slate-400">
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Academic Year select */}
            {availableYears.length > 0 && (
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-600 outline-none font-semibold hover:border-slate-300 transition-colors"
              >
                {availableYears.map((yearOption) => (
                  <option key={yearOption} value={yearOption}>
                    {yearOption}
                  </option>
                ))}
              </select>
            )}

            {/* Search box */}
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 gap-2 w-full sm:w-52">
              <Search size={13} className="text-slate-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search events..."
                className="bg-transparent text-xs text-slate-700 placeholder:text-slate-400 outline-none w-full font-medium"
              />
            </div>
          </div>
        </div>

        {/* List items block */}
        <div className="p-5 space-y-4">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-xs font-semibold">No events found</p>
              <p className="text-[11px] text-slate-300 mt-0.5">
                {searchQuery ? "Try refining your search" : "Get started by adding your first event config!"}
              </p>
            </div>
          ) : (
            filteredEvents.map((event) => (
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
                onViewDetail={() => router.push(`/club-admin/events/${event._id}`)}
              />
            ))
          )}
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
        <h3 className="text-sm font-bold text-slate-800 text-center">{title}</h3>
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
              danger ? "bg-rose-500 hover:bg-rose-600" : "bg-slate-800 hover:bg-slate-900"
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
