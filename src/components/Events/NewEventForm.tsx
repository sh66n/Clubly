"use client";

import { Session } from "next-auth";
import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  Calendar,
  Clock,
  Users,
  Trophy,
  Award,
  DollarSign,
  ImageIcon,
  ChevronRight,
  ChevronLeft,
  Check,
  Info,
  Tag,
  UserCircle,
  UsersRound,
  X,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface NewEventFormProps {
  user: Session["user"];
}
interface SuperEvent {
  _id: string;
  name: string;
}

const STEPS = [
  { id: 1, label: "Basics", icon: Info },
  { id: 2, label: "Details", icon: Users },
  { id: 3, label: "Settings", icon: Trophy },
];

export default function NewEventForm({ user }: NewEventFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const [step, setStep] = useState(1);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [eventType, setEventType] = useState<"individual" | "team">(
    "individual",
  );
  const [teamSizeMode, setTeamSizeMode] = useState<"fixed" | "range">("fixed");
  const [loading, setLoading] = useState(false);
  const [superEvents, setSuperEvents] = useState<SuperEvent[]>([]);
  const [selectedSuperEvent, setSelectedSuperEvent] = useState("");
  const [providesCertificate, setProvidesCertificate] = useState(true);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState("");
  const [fee, setFee] = useState("");
  const [maxReg, setMaxReg] = useState("");
  const [teamSize, setTeamSize] = useState("");
  const [teamMin, setTeamMin] = useState("");
  const [teamMax, setTeamMax] = useState("");

  useEffect(() => {
    async function fetchSuperEvents() {
      try {
        const res = await fetch(`/api/superevents?club=${user.adminClub}`);
        const data = await res.json();
        setSuperEvents(data);
      } catch (err) {
        console.error("Failed to fetch super events", err);
      }
    }
    fetchSuperEvents();
  }, [user.adminClub]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (picked.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10MB");
      e.target.value = "";
      return;
    }
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  // Step validation before advancing
  const canAdvance = () => {
    if (step === 1) return eventName.trim() && eventDate && eventTime;
    if (step === 2) {
      if (eventType === "team") {
        if (teamSizeMode === "fixed") return !!teamSize;
        return !!teamMin && !!teamMax;
      }
      return true;
    }
    return true;
  };

  /* ── Build FormData from state, not from DOM ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventDate || !eventTime) {
      toast.error("Please fill in date and time");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.set("name", eventName.trim());
    formData.set("description", description.trim());
    formData.set("date", eventDate);
    formData.set("eventTime", eventTime);
    formData.set("eventType", eventType);
    formData.set("providesCertificate", String(providesCertificate));
    formData.set("registrationFee", fee || "0");
    formData.set("organizingClub", user.adminClub);

    if (prize) formData.set("prize", prize);
    if (maxReg) formData.set("maxRegistrations", maxReg);
    if (selectedSuperEvent) formData.set("superEvent", selectedSuperEvent);
    if (file) formData.set("image", file);

    if (eventType === "individual") {
      formData.set("teamSize", "1");
    } else {
      if (teamSizeMode === "fixed") {
        formData.set("teamSize", teamSize);
      } else {
        formData.set("teamSizeRange[min]", teamMin);
        formData.set("teamSizeRange[max]", teamMax);
      }
    }

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json();
        if (res.status === 401) {
          router.push(
            `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`,
          );
          return;
        }
        if (res.status === 403) {
          router.replace("/forbidden");
          return;
        }
        toast.error(data.error ?? "Something went wrong");
        return;
      }
      toast.success("Event created successfully!");
      router.push("/events");
    } catch {
      toast.error("Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : null;

  const formatTime = (t: string) => {
    if (!t) return null;
    const [h, m] = t.split(":").map(Number);
    return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
  };

  return (
    // NOTE: onSubmit is on the form, but we never read e.target inputs — we use state
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      {/* Stepper */}
      <div className="flex items-center justify-between mb-8 px-2">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isActive = step === s.id;
          const isDone = step > s.id;
          return (
            <div key={s.id} className="flex items-center flex-1">
              <button
                type="button"
                onClick={() => isDone && setStep(s.id)}
                className={`flex flex-col items-center gap-1 transition-all ${isDone ? "cursor-pointer" : "cursor-default"}`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${
                    isActive
                      ? "border-blue-500 bg-blue-500/20 text-blue-400 scale-110"
                      : isDone
                        ? "border-green-500 bg-green-500/20 text-green-400"
                        : "border-gray-700 bg-gray-800/50 text-gray-500"
                  }`}
                >
                  {isDone ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Icon className="w-4 h-4" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${isActive ? "text-blue-400" : isDone ? "text-green-400" : "text-gray-500"}`}
                >
                  {s.label}
                </span>
              </button>
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-px mx-3 transition-colors duration-500 ${step > s.id ? "bg-green-500/50" : "bg-gray-700"}`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Card */}
      <div className="bg-[#0d0d0d] border border-[#2a2a2a] rounded-2xl overflow-hidden shadow-2xl">
        {previewUrl && (
          <div className="relative w-full h-36 overflow-hidden">
            <img
              src={previewUrl}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0d0d0d]" />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreviewUrl(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
              }}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center text-gray-300 hover:text-white transition-all"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <div className="p-6 flex flex-col gap-6">
          {/* STEP 1 */}
          {step === 1 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <SectionLabel>Event Basics</SectionLabel>

              <Field label="Event Name" icon={<Tag className="w-4 h-4" />}>
                <input
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  placeholder="e.g. Hackathon 2025"
                  required
                  className={inputCls}
                />
              </Field>

              <Field
                label="Description"
                icon={<Info className="w-4 h-4" />}
                optional
              >
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell participants what to expect..."
                  rows={4}
                  className={`${inputCls} resize-none`}
                />
                <span className="text-xs text-gray-600 text-right">
                  {description.length} chars
                </span>
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Date" icon={<Calendar className="w-4 h-4" />}>
                  <input
                    type="date"
                    min={today}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className={inputCls}
                  />
                </Field>
                <Field label="Time" icon={<Clock className="w-4 h-4" />}>
                  <input
                    type="time"
                    value={eventTime}
                    onChange={(e) => setEventTime(e.target.value)}
                    required
                    className={inputCls}
                  />
                </Field>
              </div>

              {(eventName || eventDate) && (
                <div className="rounded-xl bg-blue-500/5 border border-blue-500/20 px-4 py-3 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {eventName || "Your Event"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {[formatDate(eventDate), formatTime(eventTime)]
                        .filter(Boolean)
                        .join(" · ") || "Date & time TBD"}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <SectionLabel>Participants & Format</SectionLabel>

              <Field label="Event Type" icon={<Users className="w-4 h-4" />}>
                <div className="grid grid-cols-2 gap-3">
                  {(["individual", "team"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setEventType(t);
                        if (t === "individual") setTeamSizeMode("fixed");
                      }}
                      className={`flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all duration-200
                        ${
                          eventType === t
                            ? "border-blue-500 bg-blue-500/10 text-blue-300"
                            : "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600"
                        }`}
                    >
                      {t === "individual" ? (
                        <UserCircle className="w-6 h-6" />
                      ) : (
                        <UsersRound className="w-6 h-6" />
                      )}
                      <span className="text-sm font-medium capitalize">
                        {t}
                      </span>
                    </button>
                  ))}
                </div>
              </Field>

              {eventType === "team" && (
                <Field
                  label="Team Size"
                  icon={<UsersRound className="w-4 h-4" />}
                >
                  <div className="flex gap-2 mb-3">
                    {(["fixed", "range"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setTeamSizeMode(m)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-all
                          ${
                            teamSizeMode === m
                              ? "border-purple-500 bg-purple-500/10 text-purple-300"
                              : "border-gray-700 bg-gray-800/30 text-gray-400 hover:border-gray-600"
                          }`}
                      >
                        {m.charAt(0).toUpperCase() + m.slice(1)}
                      </button>
                    ))}
                  </div>
                  {teamSizeMode === "fixed" ? (
                    <input
                      type="number"
                      min={1}
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      placeholder="Exact team size (e.g. 4)"
                      required
                      className={inputCls}
                    />
                  ) : (
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={teamMin}
                        onChange={(e) => setTeamMin(e.target.value)}
                        placeholder="Min"
                        required
                        className={inputCls}
                      />
                      <span className="text-gray-500">to</span>
                      <input
                        type="number"
                        min={1}
                        value={teamMax}
                        onChange={(e) => setTeamMax(e.target.value)}
                        placeholder="Max"
                        required
                        className={inputCls}
                      />
                    </div>
                  )}
                </Field>
              )}

              <Field
                label="Add to Super Event"
                icon={<Tag className="w-4 h-4" />}
                optional
              >
                <select
                  value={selectedSuperEvent}
                  onChange={(e) => setSelectedSuperEvent(e.target.value)}
                  className={inputCls}
                >
                  <option value="">None — standalone event</option>
                  {superEvents.map((se) => (
                    <option key={se._id} value={se._id}>
                      {se.name}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                label="Event Banner"
                icon={<ImageIcon className="w-4 h-4" />}
                optional
              >
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-5 flex flex-col items-center gap-2 cursor-pointer transition-all
                    ${previewUrl ? "border-blue-500/40 bg-blue-500/5" : "border-gray-700 hover:border-gray-500 bg-gray-800/20"}`}
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-full h-28 object-cover rounded-lg"
                      />
                      <p className="text-xs text-blue-400">{file?.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-gray-500" />
                      <p className="text-sm text-gray-400">
                        Click to upload banner
                      </p>
                      <p className="text-xs text-gray-600">
                        PNG, JPG, WEBP · Max 10MB
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </Field>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <SectionLabel>Prizes & Registration</SectionLabel>

              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Prize Pool"
                  icon={<Trophy className="w-4 h-4" />}
                  optional
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={prize}
                      onChange={(e) => setPrize(e.target.value)}
                      placeholder="0"
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </Field>
                <Field
                  label="Registration Fee"
                  icon={<DollarSign className="w-4 h-4" />}
                >
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={fee}
                      onChange={(e) => setFee(e.target.value)}
                      placeholder="0"
                      required
                      className={`${inputCls} pl-7`}
                    />
                  </div>
                </Field>
              </div>

              <Field
                label="Max Registrations"
                icon={<Users className="w-4 h-4" />}
                optional
              >
                <input
                  type="number"
                  value={maxReg}
                  onChange={(e) => setMaxReg(e.target.value)}
                  placeholder="Unlimited"
                  className={inputCls}
                />
              </Field>

              <Field label="Certificate" icon={<Award className="w-4 h-4" />}>
                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-800/40 border border-gray-700">
                  <div>
                    <p className="text-sm font-medium text-gray-200">
                      Provides Certificate
                    </p>
                    <p className="text-xs text-gray-500">
                      Participants receive a certificate
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setProvidesCertificate((p) => !p)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${providesCertificate ? "bg-blue-500" : "bg-gray-700"}`}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${providesCertificate ? "translate-x-6" : ""}`}
                    />
                  </button>
                </div>
              </Field>

              {/* Summary */}
              <div className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800/60 border border-gray-700 p-4 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Summary
                </p>
                <SummaryRow label="Event" value={eventName || "—"} />
                <SummaryRow label="Date" value={formatDate(eventDate) || "—"} />
                <SummaryRow label="Time" value={formatTime(eventTime) || "—"} />
                <SummaryRow
                  label="Type"
                  value={
                    eventType === "individual"
                      ? "Individual"
                      : `Team · ${teamSizeMode === "fixed" ? `${teamSize || "?"}` : `${teamMin || "?"}–${teamMax || "?"}`}`
                  }
                />
                <SummaryRow label="Fee" value={fee ? `₹${fee}` : "Free"} />
                <SummaryRow
                  label="Prize"
                  value={prize ? `₹${prize}` : "None"}
                />
                <SummaryRow
                  label="Certificate"
                  value={providesCertificate ? "Yes ✓" : "No"}
                />
                <SummaryRow
                  label="Cap"
                  value={maxReg ? `${maxReg} slots` : "Unlimited"}
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between gap-3 pt-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-all text-sm font-medium"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => s + 1)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition-all ml-auto"
              >
                Continue <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium transition-all ml-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Creating…
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Create Event
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

/* ── Helpers ── */
const inputCls =
  "w-full rounded-xl border border-gray-700 bg-gray-800/50 px-4 py-2.5 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
      {children}
    </h3>
  );
}

function Field({
  label,
  icon,
  children,
  optional,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-sm font-medium text-gray-300">
        <span className="text-gray-500">{icon}</span>
        {label}
        {optional && (
          <span className="text-xs text-gray-600 font-normal ml-1">
            optional
          </span>
        )}
      </label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-200 font-medium">{value}</span>
    </div>
  );
}
