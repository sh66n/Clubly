"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Tag, Upload, ImageIcon, Check, X, ArrowLeft } from "lucide-react";
import CertificateLayoutEditor from "@/components/Events/CertificateLayoutEditor";
import { getDefaultCertificateLayout } from "@/lib/certificate";
import Link from "next/link";

interface CertificateFormProps {
  initialData?: any;
}

export default function CertificateForm({ initialData }: CertificateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.url || null);
  const [layout, setLayout] = useState(initialData?.layout || getDefaultCertificateLayout());
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      toast.error("Template must be an image");
      e.target.value = "";
      return;
    }
    if (picked.size > 4 * 1024 * 1024) {
      toast.error("Template must be less than 4MB");
      e.target.value = "";
      return;
    }
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name for the certificate");
      return;
    }
    if (!initialData && !file) {
      toast.error("Please upload a certificate template image");
      return;
    }
    setLoading(true);

    const formData = new FormData();
    formData.set("name", name.trim());
    if (file) {
      formData.set("certificateTemplateImage", file);
    }
    formData.set("certificateLayout", JSON.stringify(layout));

    try {
      const url = initialData ? `/api/club-admin/certificates/${initialData._id}` : "/api/club-admin/certificates";
      const method = initialData ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save certificate");
        return;
      }
      toast.success(initialData ? "Certificate updated!" : "Certificate created!");
      router.push("/club-admin/certificates");
      router.refresh();
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-8">
      <Link href="/club-admin/certificates" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 font-medium mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Certificates
      </Link>
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 md:p-8 flex flex-col gap-6">
          <div>
            <h2 className="text-xl font-bold text-slate-800 mb-1">
              {initialData ? "Edit Certificate" : "New Certificate"}
            </h2>
            <p className="text-sm text-slate-500">
              Create a reusable certificate template for your events.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Certificate Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hackathon Winner Template"
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/20 focus:border-[#7CB342] transition-all shadow-sm"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-700">Template Image</label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer transition-all ${
                  previewUrl ? "border-[#7CB342]/30 bg-[#7CB342]/5" : "border-slate-300 hover:border-[#7CB342]/50 bg-slate-50"
                }`}
              >
                {previewUrl ? (
                  <>
                    <img src={previewUrl} alt="Template Preview" className="w-full h-auto object-contain rounded-lg shadow-sm" style={{ maxHeight: "300px" }} />
                    <p className="text-sm font-medium text-[#7CB342]">{file?.name || "Existing template"}</p>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100">
                      <Upload className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-700">Click to upload template</p>
                      <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP · Max 4MB</p>
                    </div>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
            </div>

            {previewUrl && (
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Variables Layout</label>
                <CertificateLayoutEditor
                  templatePreviewUrl={previewUrl}
                  layout={layout}
                  onChange={setLayout}
                />
              </div>
            )}

            <div className="flex justify-end pt-6 border-t border-slate-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#7CB342] hover:bg-[#689F38] disabled:opacity-50 text-white text-sm font-semibold transition-all shadow-sm"
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Check className="w-4 h-4" />}
                {initialData ? "Save Changes" : "Create Certificate"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
