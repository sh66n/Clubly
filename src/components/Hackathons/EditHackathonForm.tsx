"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Upload,
  Loader2,
  Trash2,
  AlertCircle,
  FileCode2,
  Users,
  Trophy,
  Info,
  CheckCircle2,
} from "lucide-react";
import CustomQuestionsEditor, {
  CustomQuestion,
  normalizeCustomQuestions,
} from "@/components/Events/CustomQuestionsEditor";

interface EditHackathonFormProps {
  hackathon: any;
  onSuccess?: () => void;
}

export default function EditHackathonForm({
  hackathon,
  onSuccess,
}: EditHackathonFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Form states
  const [name, setName] = useState(hackathon?.name || "");
  const [description, setDescription] = useState(hackathon?.description || "");
  const [status, setStatus] = useState<"draft" | "live" | "completed">(
    hackathon?.status || "live"
  );
  const [prize, setPrize] = useState(hackathon?.prize?.toString() || "");
  const [maxRegistrations, setMaxRegistrations] = useState(
    hackathon?.maxRegistrations?.toString() || ""
  );
  const [whatsappGroupLink, setWhatsappGroupLink] = useState(
    hackathon?.whatsappGroupLink || ""
  );
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(
    hackathon?.isRegistrationOpen ?? true
  );

  // Team config
  const [teamSizeMode, setTeamSizeMode] = useState<"fixed" | "range">(
    hackathon?.teamSizeRange?.min ? "range" : "fixed"
  );
  const [teamSize, setTeamSize] = useState(
    hackathon?.teamSize?.toString() || "5"
  );
  const [teamMin, setTeamMin] = useState(
    hackathon?.teamSizeRange?.min?.toString() || "2"
  );
  const [teamMax, setTeamMax] = useState(
    hackathon?.teamSizeRange?.max?.toString() || "5"
  );

  // Banner image
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    hackathon?.image || null
  );

  // Submission config
  const [templateUrl, setTemplateUrl] = useState(
    hackathon?.submissionConfig?.templateUrl || ""
  );
  const [allowedFormats, setAllowedFormats] = useState<string[]>(
    hackathon?.submissionConfig?.allowedFormats || ["pdf", "pptx"]
  );
  const [maxFileSizeMB, setMaxFileSizeMB] = useState(
    hackathon?.submissionConfig?.maxFileSizeMB || 20
  );

  // Custom questions
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>(
    hackathon?.customQuestions || []
  );

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    setBannerFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleFormatToggle = (fmt: string) => {
    if (allowedFormats.includes(fmt)) {
      if (allowedFormats.length === 1) {
        toast.error("At least one format required");
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
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("status", status);
      formData.append("isRegistrationOpen", isRegistrationOpen ? "true" : "false");

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
      formData.append(
        "customQuestions",
        JSON.stringify(normalizeCustomQuestions(customQuestions))
      );

      const res = await fetch(`/api/hackathons/${hackathon._id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update hackathon");
      }

      toast.success("Hackathon updated successfully!");
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update hackathon");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${hackathon.name}"? This action cannot be undone.`
      )
    )
      return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/hackathons/${hackathon._id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete hackathon");
      }

      toast.success("Hackathon deleted successfully");
      router.push("/club-admin/hackathons");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete hackathon");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Basics & Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Info size={18} className="text-[#7CB342]" /> Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hackathon Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342] text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342] text-sm"
              >
                <option value="draft">Draft (Hidden)</option>
                <option value="live">Live (Open for Teams)</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Registration Availability
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRegistrationOpen}
                    onChange={(e) => setIsRegistrationOpen(e.target.checked)}
                    className="w-4 h-4 rounded text-[#7CB342] focus:ring-[#7CB342]"
                  />
                  <span>Accepting New Registrations</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Poster / Banner Image
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-[#7CB342] rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50 hover:bg-slate-100/50 min-h-[160px] flex items-center justify-center relative overflow-hidden"
            >
              {previewUrl ? (
                <div className="relative w-full h-36 rounded-xl overflow-hidden group">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain bg-black"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-white text-xs font-semibold">
                    Change Banner
                  </div>
                </div>
              ) : (
                <div className="text-slate-400 space-y-1">
                  <Upload size={20} className="mx-auto text-[#7CB342]" />
                  <p className="text-xs font-semibold text-slate-700">Upload Image</p>
                  <p className="text-[10px]">PNG, JPG, WebP</p>
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
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            About / Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/30 focus:border-[#7CB342] text-sm leading-relaxed"
          />
        </div>
      </div>

      {/* 2. Team Size & Prize Pool */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <Users size={18} className="text-[#7CB342]" /> Team & Prize Configuration
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Team Size Limits
            </label>
            <div className="flex gap-4 mb-2">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="teamMode"
                  checked={teamSizeMode === "fixed"}
                  onChange={() => setTeamSizeMode("fixed")}
                />
                Fixed Size
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="teamMode"
                  checked={teamSizeMode === "range"}
                  onChange={() => setTeamSizeMode("range")}
                />
                Min/Max Range
              </label>
            </div>

            {teamSizeMode === "fixed" ? (
              <input
                type="number"
                min={1}
                max={20}
                value={teamSize}
                onChange={(e) => setTeamSize(e.target.value)}
                className="w-32 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            ) : (
              <div className="flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-400">Min</span>
                  <input
                    type="number"
                    min={1}
                    value={teamMin}
                    onChange={(e) => setTeamMin(e.target.value)}
                    className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400">Max</span>
                  <input
                    type="number"
                    min={1}
                    value={teamMax}
                    onChange={(e) => setTeamMax(e.target.value)}
                    className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Prize Pool (₹)
              </label>
              <input
                type="number"
                value={prize}
                onChange={(e) => setPrize(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
                placeholder="50000"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                WhatsApp Community Link
              </label>
              <input
                type="url"
                value={whatsappGroupLink}
                onChange={(e) => setWhatsappGroupLink(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
                placeholder="https://chat.whatsapp.com/..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* 3. PPT Template & Rules */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
          <FileCode2 size={18} className="text-[#7CB342]" /> Submission & PPT Template
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Official PPT Format Download URL (Google Drive, Cloudinary, etc.)
          </label>
          <input
            type="url"
            value={templateUrl}
            onChange={(e) => setTemplateUrl(e.target.value)}
            placeholder="https://drive.google.com/..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Allowed Formats
            </label>
            <div className="flex gap-4">
              {["pdf", "pptx", "zip"].map((fmt) => (
                <label key={fmt} className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Max File Size (MB)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxFileSizeMB}
              onChange={(e) => setMaxFileSizeMB(parseInt(e.target.value) || 20)}
              className="w-28 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      {/* 4. Custom Registration Questions */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-base font-bold text-slate-800">
          Custom Registration Questionnaire
        </h3>
        <CustomQuestionsEditor
          value={customQuestions}
          onChange={setCustomQuestions}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleteLoading || loading}
          className="flex items-center gap-2 text-red-600 hover:text-red-700 px-4 py-2.5 rounded-xl border border-red-200 hover:bg-red-50 text-xs font-bold transition disabled:opacity-50"
        >
          {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          Delete Hackathon
        </button>

        <button
          type="submit"
          disabled={loading || deleteLoading}
          className="flex items-center gap-2 bg-[#7CB342] text-white px-8 py-3 rounded-xl text-xs font-bold hover:bg-[#689f38] transition shadow-md disabled:opacity-50"
        >
          {loading && <Loader2 size={14} className="animate-spin" />}
          {loading ? "Saving Changes..." : "Save Hackathon Settings"}
        </button>
      </div>
    </form>
  );
}
