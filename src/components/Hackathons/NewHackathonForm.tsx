"use client";

import { useEffect, useState, useRef } from "react";
import {
  Loader2,
  Trophy,
  Users,
  ImageIcon,
  ChevronRight,
  ChevronLeft,
  Info,
  Layers,
  FileCode2,
  Upload,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RoundsBuilder, Round } from "./RoundsBuilder";
import CustomQuestionsEditor, {
  CustomQuestion,
  normalizeCustomQuestions,
} from "@/components/Events/CustomQuestionsEditor";

interface NewHackathonFormProps {
  clubId?: string;
}

const STEPS = [
  { id: 1, label: "Basics", icon: Info },
  { id: 2, label: "Team Config", icon: Users },
  { id: 3, label: "Rounds", icon: Layers },
  { id: 4, label: "Submissions & Rules", icon: FileCode2 },
];

export default function NewHackathonForm({ clubId }: NewHackathonFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Step 1: Basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [prize, setPrize] = useState("");
  const [maxRegistrations, setMaxRegistrations] = useState("");
  const [whatsappGroupLink, setWhatsappGroupLink] = useState("");

  // Step 2: Team Config
  const [teamSizeMode, setTeamSizeMode] = useState<"fixed" | "range">("fixed");
  const [teamSize, setTeamSize] = useState("5");
  const [teamMin, setTeamMin] = useState("2");
  const [teamMax, setTeamMax] = useState("5");

  // Step 3: Rounds
  const [rounds, setRounds] = useState<Round[]>([
    {
      id: "r1",
      name: "Round 1 — PPT & Idea Submission",
      description: "Initial submission round with PPT template",
      registrationFee: 0,
      requiresSubmission: true,
      submissionDeadline: "",
      resultDate: "",
      submissionInstructions: "Prepare and submit your presentation strictly according to the provided format.",
    },
    {
      id: "r2",
      name: "Round 2 — Prototype & Finals",
      description: "Shortlisted teams will compete in the offline round",
      registrationFee: 500,
      requiresSubmission: false,
      submissionDeadline: "",
      resultDate: "",
      submissionInstructions: "Detailed requirements for Round 2 will be announced after Round 1 results.",
    },
  ]);

  // Step 4: Submission & Custom Questions
  const [templateUrl, setTemplateUrl] = useState("");
  const [allowedFormats, setAllowedFormats] = useState<string[]>(["pdf", "pptx"]);
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(20);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);

  // Banner image picker
  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WebP)");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      return;
    }

    setBannerFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormatToggle = (fmt: string) => {
    if (allowedFormats.includes(fmt)) {
      if (allowedFormats.length === 1) {
        toast.error("At least one file format must be allowed");
        return;
      }
      setAllowedFormats(allowedFormats.filter((f) => f !== fmt));
    } else {
      setAllowedFormats([...allowedFormats, fmt]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Hackathon name is required");
      setStep(1);
      return;
    }

    if (teamSizeMode === "fixed" && (!teamSize || parseInt(teamSize) < 1)) {
      toast.error("Please provide a valid team size");
      setStep(2);
      return;
    }

    if (teamSizeMode === "range") {
      const min = parseInt(teamMin);
      const max = parseInt(teamMax);
      if (isNaN(min) || isNaN(max) || min < 1 || max < min) {
        toast.error("Please provide a valid min/max team size range");
        setStep(2);
        return;
      }
    }

    if (rounds.length === 0) {
      toast.error("Please configure at least one round");
      setStep(3);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      if (clubId) {
        formData.append("organizingClub", clubId);
      }
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("status", "live");
      formData.append("isRegistrationOpen", "true");

      if (bannerFile) {
        formData.append("image", bannerFile);
      }

      if (prize) formData.append("prize", prize);
      if (maxRegistrations) formData.append("maxRegistrations", maxRegistrations);
      if (whatsappGroupLink) formData.append("whatsappGroupLink", whatsappGroupLink);

      // Team config
      if (teamSizeMode === "fixed") {
        formData.append("teamSize", teamSize);
      } else {
        formData.append("teamSize", teamMax);
        formData.append(
          "teamSizeRange",
          JSON.stringify({ min: parseInt(teamMin), max: parseInt(teamMax) })
        );
      }

      // Submission config
      formData.append(
        "submissionConfig",
        JSON.stringify({
          templateUrl: templateUrl.trim() || undefined,
          allowedFormats,
          maxFileSizeMB,
        })
      );

      // Custom questions
      if (customQuestions.length > 0) {
        formData.append(
          "customQuestions",
          JSON.stringify(normalizeCustomQuestions(customQuestions))
        );
      }

      const res = await fetch("/api/hackathons", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to create hackathon");
      }

      const createdHackathon = await res.json();
      const hackathonId = createdHackathon._id;

      // Create rounds
      for (const round of rounds) {
        await fetch(`/api/hackathons/${hackathonId}/rounds`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: round.name,
            description: round.description,
            registrationFee: round.registrationFee || 0,
            requiresSubmission: round.requiresSubmission,
            submissionDeadline: round.submissionDeadline || undefined,
            resultDate: round.resultDate || undefined,
            submissionInstructions: round.submissionInstructions || undefined,
          }),
        });
      }

      toast.success("Hackathon created successfully!");
      router.push(`/club-admin/hackathons/${hackathonId}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to create hackathon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden max-w-4xl mx-auto">
      {/* Wizard Header / Stepper */}
      <div className="border-b border-slate-200 bg-slate-50/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Create New Hackathon</h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Set up your hackathon, team parameters, stages, and PPT submission rules.
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
            Step {step} of {STEPS.length}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-6">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isCompleted = step > s.id;
            const isCurrent = step === s.id;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setStep(s.id)}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? "bg-white border-[#7CB342] text-slate-900 shadow-sm ring-2 ring-[#7CB342]/10"
                    : isCompleted
                    ? "bg-white/60 border-slate-200 text-slate-700 hover:bg-white"
                    : "bg-transparent border-transparent text-slate-400 opacity-60"
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg ${
                    isCurrent
                      ? "bg-[#7CB342] text-white"
                      : isCompleted
                      ? "bg-slate-200 text-slate-700"
                      : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Icon size={16} />
                </div>
                <div className="hidden sm:block">
                  <p className="text-xs font-medium">{s.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Hackathon Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. TECHNATHON 2026"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                placeholder="Details regarding the hackathon theme, domains, prizes, and key expectations..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Banner Image
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-[#7CB342] rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 hover:bg-slate-50"
              >
                {previewUrl ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                    <img
                      src={previewUrl}
                      alt="Banner Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-sm font-medium">
                      Click to change image
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-4 text-slate-500">
                    <div className="p-3 bg-white rounded-full shadow-sm border border-slate-200 mb-2 text-[#7CB342]">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">
                      Upload Event Banner
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      PNG, JPG, WebP up to 10MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerSelect}
                  className="hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Total Prize Pool (₹)
                </label>
                <input
                  type="number"
                  value={prize}
                  onChange={(e) => setPrize(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Maximum Team Registrations Cap
                </label>
                <input
                  type="number"
                  value={maxRegistrations}
                  onChange={(e) => setMaxRegistrations(e.target.value)}
                  placeholder="e.g. 100 (Leave empty for unlimited)"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                WhatsApp Participant Group Link
              </label>
              <input
                type="url"
                value={whatsappGroupLink}
                onChange={(e) => setWhatsappGroupLink(e.target.value)}
                placeholder="https://chat.whatsapp.com/..."
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
              />
            </div>
          </div>
        )}

        {/* STEP 2: TEAM CONFIG */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Team Size Mode
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setTeamSizeMode("fixed")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    teamSizeMode === "fixed"
                      ? "border-[#7CB342] bg-[#7CB342]/5 ring-2 ring-[#7CB342]/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="font-semibold text-slate-800">Fixed Team Size</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Every team must have exact number of members (e.g. 5 members).
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setTeamSizeMode("range")}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    teamSizeMode === "range"
                      ? "border-[#7CB342] bg-[#7CB342]/5 ring-2 ring-[#7CB342]/20"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <p className="font-semibold text-slate-800">Team Size Range</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Allow flexible team sizes between Min and Max members (e.g. 2 to 5).
                  </p>
                </button>
              </div>
            </div>

            {teamSizeMode === "fixed" ? (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Required Team Size (Members) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={teamSize}
                  onChange={(e) => setTeamSize(e.target.value)}
                  className="w-full sm:w-48 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 max-w-sm">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Min Members
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={teamMin}
                    onChange={(e) => setTeamMin(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Max Members
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={teamMax}
                    onChange={(e) => setTeamMax(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* STEP 3: ROUNDS */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">Configuring Hackathon Stages</p>
              <p>
                Add the sequence of rounds for your hackathon. For free initial rounds, set Registration Fee to ₹0. You can set conditional fees (e.g. ₹500) for Round 2 or later stages.
              </p>
            </div>

            <RoundsBuilder rounds={rounds} onChange={setRounds} />
          </div>
        )}

        {/* STEP 4: SUBMISSIONS & RULES */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="border border-slate-200 rounded-xl p-5 space-y-4">
              <h3 className="text-base font-bold text-slate-800">
                PPT Submission & Template Configuration
              </h3>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Official PPT Format / Template Download Link (Google Drive, Cloudinary, etc.)
                </label>
                <input
                  type="url"
                  value={templateUrl}
                  onChange={(e) => setTemplateUrl(e.target.value)}
                  placeholder="https://drive.google.com/file/d/... or template URL"
                  className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Participants will be able to download this official template directly from their submission dashboard.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Allowed Submission Formats
                  </label>
                  <div className="flex gap-4">
                    {["pdf", "pptx", "zip"].map((fmt) => (
                      <label
                        key={fmt}
                        className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={allowedFormats.includes(fmt)}
                          onChange={() => handleFormatToggle(fmt)}
                          className="rounded text-[#7CB342] focus:ring-[#7CB342]"
                        />
                        .{fmt.toUpperCase()}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Max File Size (MB)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={maxFileSizeMB}
                    onChange={(e) => setMaxFileSizeMB(parseInt(e.target.value) || 20)}
                    className="w-32 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342]"
                  />
                </div>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-5">
              <h3 className="text-base font-bold text-slate-800 mb-4">
                Custom Registration Questionnaire
              </h3>
              <CustomQuestionsEditor
                value={customQuestions}
                onChange={setCustomQuestions}
              />
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition"
            >
              <ChevronLeft size={16} /> Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-2 bg-[#7CB342] text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#689f38] transition shadow-sm"
            >
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 bg-[#7CB342] text-white px-7 py-2.5 rounded-xl text-sm font-bold hover:bg-[#689f38] transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? "Creating Hackathon..." : "Launch Hackathon"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
