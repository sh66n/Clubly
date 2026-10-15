"use client";
import React, { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Image as ImageIcon, Loader2, Plus, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EventPhotosSectionProps {
  eventId: string;
}

export default function EventPhotosSection({ eventId }: EventPhotosSectionProps) {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPhotos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/club-admin/events/${eventId}/photos`);
      if (!res.ok) throw new Error("Failed to load photos");
      const data = await res.json();
      setPhotos(data.eventPhotos || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [eventId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (PNG, JPG, WEBP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image file size should be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("photo", file);

      const res = await fetch(`/api/club-admin/events/${eventId}/photos`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to upload photo");

      toast.success("Photo uploaded successfully!");
      setPhotos((prev) => [...prev, data.photoUrl]);
    } catch (err: any) {
      toast.error(err.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = async (photoUrl: string) => {
    try {
      setDeletingUrl(photoUrl);
      const res = await fetch(`/api/club-admin/events/${eventId}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete photo");

      toast.success("Photo removed");
      setPhotos((prev) => prev.filter((p) => p !== photoUrl));
    } catch (err: any) {
      toast.error(err.message || "Failed to delete photo");
    } finally {
      setDeletingUrl(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <ImageIcon size={18} className="text-[#7CB342]" />
            <h3 className="text-base font-bold text-slate-800">Event Photos & NAAC Glimpses</h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload official photographs of this event. These photos automatically populate the NAAC Audit Report glimpses section.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-60"
          >
            {uploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <Plus size={15} />
                Upload Photo
              </>
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="text-[#7CB342] animate-spin" />
        </div>
      ) : photos.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center space-y-2">
          <div className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
            <Upload size={18} />
          </div>
          <p className="text-xs font-semibold text-slate-700">No photos uploaded for this event yet</p>
          <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
            Upload at least 4 photos so the Faculty Coordinator can generate a complete NAAC report with event glimpses.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((url, idx) => (
            <div
              key={idx}
              className="group relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shadow-2xs"
            >
              <img
                src={url}
                alt={`Event photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  onClick={() => handleDeletePhoto(url)}
                  disabled={deletingUrl === url}
                  className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  title="Delete photo"
                >
                  {deletingUrl === url ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
