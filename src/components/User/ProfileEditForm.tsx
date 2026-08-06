"use client";

import React, { useState, useRef } from "react";
import { User, Loader2, Mail, Camera, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Session } from "next-auth";
import Link from "next/link";
import { getProfileStatus } from "@/lib/utils";

interface ProfileEditFormProps {
  user: Session["user"] & {
    year?: string;
    department?: string;
    phoneNumber?: string;
    college?: string;
    _id?: string;
  };
}

export default function ProfileEditForm({ user }: ProfileEditFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(
    user?.image || null,
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);

    try {
      const res = await fetch(`/api/users/${user._id}`, {
        method: "PATCH",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update profile");
        return;
      }

      toast.success("Profile updated successfully");
      router.push("/dashboard");
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const { percentage, isComplete, missingFields } = getProfileStatus(user);

  return (
    <form onSubmit={handleSubmit} className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-24">
        {/* LEFT COLUMN: Identity & Avatar */}
        <aside className="lg:w-1/3 space-y-8">
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Profile Picture
            </h2>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Add your custom profile picture.
            </p>
          </div>

          <div className="group relative w-32 h-32 lg:w-44 lg:h-44">
            <div className="w-full h-full rounded-3xl overflow-hidden ring-1 ring-zinc-800 bg-zinc-900/50 flex items-center justify-center transition-all group-hover:ring-zinc-600 shadow-2xl">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-zinc-800" />
              )}
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 rounded-3xl bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-sm"
            >
              <Camera className="w-6 h-6 text-white mb-2" />
              <span className="text-[10px] text-white font-bold uppercase tracking-widest">
                Update
              </span>
            </button>
            <input
              type="file"
              name="avatar"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>

          {/* Minimalist Completeness Card */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-3 mt-6">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-400 font-medium">Profile Completeness</span>
              <span className={`font-semibold ${isComplete ? "text-emerald-400" : "text-amber-500"}`}>{percentage}%</span>
            </div>
            
            <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-emerald-500' : 'bg-amber-500'}`}
                style={{ width: `${percentage}%` }}
              />
            </div>

            {missingFields.length > 0 ? (
              <p className="text-[11px] text-zinc-500 leading-normal">
                Please add: {missingFields.join(", ")}
              </p>
            ) : (
              <p className="text-[11px] text-emerald-400 font-medium">
                Profile is 100% complete.
              </p>
            )}
          </div>
        </aside>

        {/* RIGHT COLUMN: The Form */}
        <div className="flex-1 space-y-12">
          {/* Personal Info Section */}
          <section className="space-y-6">
            <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em] pb-3 border-b border-white/5">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 ml-1">
                  Full Name
                </label>
                <input
                  name="name"
                  defaultValue={user?.name || ""}
                  placeholder="e.g. Alex Rivera"
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:ring-1 focus:ring-zinc-500 outline-none transition-all placeholder:text-zinc-700"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Department Select */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 ml-1">
                    Department
                  </label>
                  <select
                    name="department"
                    defaultValue={user?.department || ""}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:ring-1 focus:ring-zinc-500 outline-none transition-all"
                  >
                    <option value="" disabled className="bg-zinc-950 text-zinc-400">Select Department</option>
                    <option value="Computer Engineering" className="bg-zinc-950 text-zinc-200">Computer Engineering</option>
                    <option value="Information Technology" className="bg-zinc-950 text-zinc-200">Information Technology</option>
                    <option value="Computer Science and Engineering (AI & ML)" className="bg-zinc-950 text-zinc-200">Computer Science and Engineering (AI & ML)</option>
                    <option value="Electronics and Computer Science (ECS)" className="bg-zinc-950 text-zinc-200">Electronics and Computer Science (ECS)</option>
                    <option value="Mechatronics" className="bg-zinc-950 text-zinc-200">Mechatronics</option>
                    <option value="Electronics & Telecommunications" className="bg-zinc-950 text-zinc-200">Electronics & Telecommunications</option>
                  </select>
                </div>
                {/* Year Select */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 ml-1">
                    Year
                  </label>
                  <select
                    name="year"
                    defaultValue={user?.year || ""}
                    className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:ring-1 focus:ring-zinc-500 outline-none transition-all"
                  >
                    <option value="" disabled className="bg-zinc-950 text-zinc-400">Select Year</option>
                    <option value="1" className="bg-zinc-950 text-zinc-200">FE (1st Year)</option>
                    <option value="2" className="bg-zinc-950 text-zinc-200">SE (2nd Year)</option>
                    <option value="3" className="bg-zinc-950 text-zinc-200">TE (3rd Year)</option>
                    <option value="4" className="bg-zinc-950 text-zinc-200">BE (4th Year)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="space-y-6">
            <h2 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.3em] pb-3 border-b border-white/5">
              Contact Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 ml-1">
                  Phone Number
                </label>
                <input
                  name="phoneNumber"
                  defaultValue={user?.phoneNumber || ""}
                  placeholder="+1 (000) 000-0000"
                  className="w-full bg-zinc-900/40 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:ring-1 focus:ring-zinc-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-500 ml-1 flex items-center gap-2">
                  Email Address <Lock className="w-3 h-3" />
                </label>
                <div className="relative">
                  <input
                    value={user?.email || ""}
                    disabled
                    className="w-full bg-zinc-950/50 border border-zinc-900 rounded-xl px-4 py-3 text-sm text-zinc-600 cursor-not-allowed"
                  />
                  <Mail className="absolute right-4 top-3.5 w-4 h-4 text-zinc-800" />
                </div>
              </div>
            </div>


          </section>

          {/* Action Bar */}
          <div className="pt-10 flex items-center justify-end gap-10">
            <Link
              href="/dashboard"
              className="text-xs font-medium text-zinc-500 hover:text-white transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-white hover:bg-zinc-200 text-black px-12 py-3 rounded-full text-xs font-black transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
