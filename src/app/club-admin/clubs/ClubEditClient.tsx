"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Upload,
  ExternalLink,
  Users,
  Calendar,
  Bell,
  Heart,
  GraduationCap,
  Sparkles,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Layers,
} from "lucide-react";
import { toast } from "sonner";

interface FacultyCoordinator {
  _id: string;
  name: string;
  email: string;
  image?: string;
  department?: string;
  phoneNumber?: string;
}

interface ClubData {
  _id: string;
  name: string;
  fullName: string;
  department: string;
  logo: string;
  eventsCount?: number;
  totalMembers?: number;
  coreCount?: number;
  volunteerCount?: number;
  followersCount?: number;
  bellFollowersCount?: number;
  facultyCoordinator?: FacultyCoordinator | null;
}

interface ClubEditClientProps {
  initialClub: ClubData;
}

const COMMON_DEPARTMENTS = [
  "Computer Engineering",
  "Information Technology",
  "Artificial Intelligence & Data Science",
  "Electronics & Telecommunication",
  "Mechanical Engineering",
  "Civil Engineering",
  "Applied Sciences & Humanities",
  "Multidisciplinary / All Departments",
];

export default function ClubEditClient({ initialClub }: ClubEditClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [name, setName] = useState(initialClub.name || "");
  const [fullName, setFullName] = useState(initialClub.fullName || "");
  const [department, setDepartment] = useState(initialClub.department || "");
  const [customDepartment, setCustomDepartment] = useState("");
  const [isCustomDept, setIsCustomDept] = useState(
    initialClub.department ? !COMMON_DEPARTMENTS.includes(initialClub.department) : false
  );

  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialClub.logo || null);

  // Status states
  const [isSaving, setIsSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const hasChanges =
    name !== initialClub.name ||
    fullName !== initialClub.fullName ||
    department !== initialClub.department ||
    imageFile !== null;

  const handleImageChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file (PNG, JPG, WEBP)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size must be under 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0]);
    }
  };

  const handleReset = () => {
    setName(initialClub.name || "");
    setFullName(initialClub.fullName || "");
    setDepartment(initialClub.department || "");
    setIsCustomDept(!COMMON_DEPARTMENTS.includes(initialClub.department || ""));
    setImageFile(null);
    setImagePreview(initialClub.logo || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Changes reset to original details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalDept = isCustomDept ? customDepartment.trim() : department.trim();

    if (!name.trim()) {
      toast.error("Club short name / acronym is required");
      return;
    }
    if (!fullName.trim()) {
      toast.error("Club full name is required");
      return;
    }
    if (!finalDept) {
      toast.error("Associated department is required");
      return;
    }

    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("fullName", fullName.trim());
      formData.append("department", finalDept);

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await fetch("/api/club-admin/clubs", {
        method: "PATCH",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update club information");
      }

      toast.success("Club profile updated successfully!");
      setImageFile(null);
      router.refresh();
    } catch (err: any) {
      console.error("Save error:", err);
      toast.error(err.message || "Failed to save club changes");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 rounded-2xl border-2 border-slate-100 overflow-hidden bg-slate-900 shadow-md shrink-0 flex items-center justify-center">
            {imagePreview ? (
              <Image
                src={imagePreview}
                alt={name || "Club Logo"}
                fill
                className="object-cover"
              />
            ) : (
              <Building2 className="w-8 h-8 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                {fullName || "My Club Profile"}
              </h1>
              {name && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-100 text-violet-800 border border-violet-200">
                  {name}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Associated with Department of{" "}
              <span className="font-medium text-slate-700">
                {department || "Engineering"}
              </span>
            </p>
          </div>
        </div>

        <Link
          href={`/clubs/${initialClub._id}`}
          target="_blank"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-sm transition-all shadow-sm shrink-0"
        >
          <span>View Public Page</span>
          <ExternalLink className="w-4 h-4 text-slate-500" />
        </Link>
      </div>

      {/* Quick Statistics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Events
            </p>
            <p className="text-lg font-bold text-slate-900">
              {initialClub.eventsCount ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Team Members
            </p>
            <p className="text-lg font-bold text-slate-900">
              {initialClub.totalMembers ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Followers
            </p>
            <p className="text-lg font-bold text-slate-900">
              {initialClub.followersCount ?? 0}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Bell Followers
            </p>
            <p className="text-lg font-bold text-slate-900">
              {initialClub.bellFollowersCount ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* Main Editing Card & Aside Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Club Information & Branding
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                Update your official identity, department mapping, and display logo.
              </p>
            </div>

            {/* Logo Image Upload Area */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-700">
                Club Logo / Avatar
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 hover:bg-slate-50 transition-colors">
                <div className="relative w-24 h-24 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-slate-900 shrink-0">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Logo Preview"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Building2 className="w-10 h-10" />
                    </div>
                  )}
                </div>

                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleFileDrop}
                  className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border ${
                    isDragging
                      ? "border-violet-500 bg-violet-50/50"
                      : "border-slate-200 bg-white"
                  } transition-all text-center cursor-pointer`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageChange(e.target.files[0]);
                      }
                    }}
                  />
                  <Upload className="w-6 h-6 text-violet-600 mb-1.5" />
                  <p className="text-sm font-semibold text-slate-800">
                    Click to upload or drag & drop logo
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Recommended 400x400 square. PNG, JPG, or WEBP (max 5MB).
                  </p>
                </div>
              </div>
            </div>

            {/* Club Short Name / Acronym */}
            <div className="space-y-1.5">
              <label
                htmlFor="club-short-name"
                className="block text-sm font-bold text-slate-700"
              >
                Club Short Name / Acronym <span className="text-rose-500">*</span>
              </label>
              <input
                id="club-short-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CSI, ACM, GDSC, IEEE"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 text-sm font-medium transition-colors"
              />
              <p className="text-xs text-slate-400">
                Shown on compact tags, event badges, and certificates.
              </p>
            </div>

            {/* Club Full Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="club-full-name"
                className="block text-sm font-bold text-slate-700"
              >
                Club Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                id="club-full-name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Computer Society of India"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 text-sm font-medium transition-colors"
              />
              <p className="text-xs text-slate-400">
                The full registered name of your club or student chapter.
              </p>
            </div>

            {/* Department Selection */}
            <div className="space-y-1.5">
              <label
                htmlFor="club-department"
                className="block text-sm font-bold text-slate-700"
              >
                Associated Department <span className="text-rose-500">*</span>
              </label>
              {!isCustomDept ? (
                <div className="space-y-2">
                  <select
                    id="club-department"
                    value={department}
                    onChange={(e) => {
                      if (e.target.value === "custom") {
                        setIsCustomDept(true);
                        setCustomDepartment("");
                      } else {
                        setDepartment(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 text-sm font-medium transition-colors"
                  >
                    <option value="" disabled>
                      Select Department
                    </option>
                    {COMMON_DEPARTMENTS.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                    <option value="custom">+ Other / Custom Department...</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={customDepartment}
                      onChange={(e) => setCustomDepartment(e.target.value)}
                      placeholder="Type department name..."
                      className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-600 text-slate-900 text-sm font-medium transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomDept(false);
                        setDepartment(initialClub.department || COMMON_DEPARTMENTS[0]);
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 border border-slate-200 hover:bg-slate-100 transition-colors"
                    >
                      Choose from list
                    </button>
                  </div>
                </div>
              )}
              <p className="text-xs text-slate-400">
                The academic engineering branch or department managing this chapter.
              </p>
            </div>

            {/* Submit & Reset Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || isSaving}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Auxiliary Cards */}
        <div className="space-y-6">
          {/* Faculty Coordinator Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2 text-violet-700">
              <GraduationCap className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 text-base">
                Faculty Coordinator
              </h3>
            </div>

            {initialClub.facultyCoordinator ? (
              <div className="flex items-center gap-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                {initialClub.facultyCoordinator.image ? (
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shrink-0">
                    <Image
                      src={initialClub.facultyCoordinator.image}
                      alt={initialClub.facultyCoordinator.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-violet-100 text-violet-700 font-bold flex items-center justify-center shrink-0">
                    {initialClub.facultyCoordinator.name[0]?.toUpperCase() || "F"}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">
                    {initialClub.facultyCoordinator.name}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {initialClub.facultyCoordinator.email}
                  </p>
                  {initialClub.facultyCoordinator.department && (
                    <p className="text-[11px] text-violet-600 font-medium truncate mt-0.5">
                      {initialClub.facultyCoordinator.department}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 text-center">
                <AlertCircle className="w-6 h-6 text-amber-500 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-amber-900">
                  No Coordinator Assigned
                </p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Assign a faculty coordinator to review events and sign official certificates.
                </p>
              </div>
            )}

            <Link
              href="/club-admin/faculty-coordinator"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              <span>Manage Faculty Coordinator</span>
            </Link>
          </div>

          {/* Guidelines / Tips Card */}
          <div className="bg-gradient-to-br from-violet-900 to-indigo-950 rounded-2xl p-6 text-white space-y-3.5 shadow-lg">
            <div className="flex items-center gap-2 text-violet-300">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-base">Branding Tips</h3>
            </div>
            <ul className="text-xs text-violet-200/90 space-y-2.5 leading-relaxed list-disc list-inside">
              <li>
                Upload high-contrast square logos (min 400x400) with transparent or solid background.
              </li>
              <li>
                Keep your short name concise (2-6 letters) so it cleanly renders on leaderboard chips.
              </li>
              <li>
                Your full name appears directly on NAAC activity reports and student achievement credentials.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
