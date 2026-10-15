"use client";
import React, { useState, useEffect, useRef } from "react";
import { PenTool, Upload, Plus, Trash2, Check, X, Loader2, Sparkles, Folder } from "lucide-react";
import { toast } from "sonner";

export interface SignatureItem {
  _id: string;
  name: string;
  imageUrl: string;
  position?: string;
}

interface SignLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (sign: SignatureItem) => void;
  defaultPersonName?: string;
  defaultPosition?: string;
}

export default function SignLibraryModal({
  isOpen,
  onClose,
  onSelect,
  defaultPersonName = "",
  defaultPosition = "",
}: SignLibraryModalProps) {
  const [signatures, setSignatures] = useState<SignatureItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // New sign upload form states
  const [newName, setNewName] = useState(defaultPersonName);
  const [newPosition, setNewPosition] = useState(defaultPosition);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setNewName(defaultPersonName);
    setNewPosition(defaultPosition);
  }, [defaultPersonName, defaultPosition]);

  const fetchSignatures = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/faculty-coordinator/signatures");
      if (!res.ok) throw new Error("Failed to load signatures");
      const data = await res.json();
      setSignatures(data.signatures || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchSignatures();
    }
  }, [isOpen]);

  const handleUploadAndSave = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!newName.trim()) {
      toast.error("Please enter the person's name before uploading their signature");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file of the signature (PNG, JPG, WEBP)");
      return;
    }

    try {
      setUploading(true);

      // 1. Upload to Cloudinary via FormData
      const formData = new FormData();
      formData.append("photo", file);

      // Using the glimpses / avatars upload pipeline or a signature upload endpoint
      const uploadRes = await fetch("/api/upload-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: await fileToBase64(file),
          publicId: `sign_${Date.now()}`,
        }),
      });

      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Failed to upload signature image");
      }

      // 2. Automatically save into Signature Library
      const saveRes = await fetch("/api/faculty-coordinator/signatures", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          position: newPosition.trim() || undefined,
          imageUrl: uploadData.url,
          publicId: uploadData.public_id,
        }),
      });

      const saveData = await saveRes.json();
      if (!saveRes.ok) throw new Error(saveData.error || "Failed to save into library");

      toast.success(`Signature for "${newName}" saved to library!`);
      const newSign = saveData.signature;
      setSignatures((prev) => [newSign, ...prev]);

      // Automatically select and attach to block
      onSelect(newSign);
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload signature");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id);
      const res = await fetch("/api/faculty-coordinator/signatures", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Failed to delete signature");
      toast.success("Signature removed from library");
      setSignatures((prev) => prev.filter((s) => s._id !== id));
    } catch (err: any) {
      toast.error(err.message || "Could not delete signature");
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#f0f7e6] text-[#7CB342] flex items-center justify-center">
              <PenTool size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">Signature Library</h3>
              <p className="text-[11px] text-slate-500">
                Browse saved signatures or upload a new one to automatically save for reuse.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Upload new sign box */}
          <div className="bg-[#fbfcfa] border border-[#e2edd3] rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#558B2F]">
              <Sparkles size={14} />
              <span>Upload & Auto-Save New Signature</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Person's Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Prof. Karishma Shambharkar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Default Title / Role (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Faculty Coordinator"
                  value={newPosition}
                  onChange={(e) => setNewPosition(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#7CB342] text-slate-800"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-slate-400">
                Transparent PNG or cropped signature image recommended
              </span>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleUploadAndSave}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !newName.trim()}
                className="px-4 py-2 bg-[#7CB342] hover:bg-[#689F38] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {uploading ? (
                  <>
                    <Loader2 size={13} className="animate-spin" />
                    Uploading…
                  </>
                ) : (
                  <>
                    <Upload size={13} />
                    Choose File & Save to Library
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Existing Signatures in Library */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Folder size={14} className="text-[#7CB342]" />
              Saved Signatures in Your Library ({signatures.length})
            </h4>

            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <Loader2 size={24} className="text-[#7CB342] animate-spin" />
              </div>
            ) : signatures.length === 0 ? (
              <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
                <PenTool size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-xs font-medium">No signatures saved in library yet</p>
                <p className="text-[10px] mt-0.5">Use the upload box above to save your first signature.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {signatures.map((sign) => (
                  <div
                    key={sign._id}
                    className="border border-slate-200 hover:border-[#7CB342] rounded-xl p-3 bg-white flex flex-col justify-between group transition-all shadow-2xs hover:shadow-sm"
                  >
                    <div className="h-16 w-full flex items-center justify-center bg-slate-50 rounded-lg p-2 overflow-hidden mb-2">
                      <img
                        src={sign.imageUrl}
                        alt={sign.name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply"
                      />
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{sign.name}</p>
                        {sign.position && (
                          <p className="text-[10px] text-slate-400 truncate">{sign.position}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleDelete(sign._id)}
                          disabled={deletingId === sign._id}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                          title="Delete from library"
                        >
                          {deletingId === sign._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            onSelect(sign);
                            onClose();
                          }}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-[#7CB342] hover:bg-[#689F38] rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} />
                          Use
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to convert File to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
