"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Upload,
  ArrowLeft,
  ArrowRight,
  RefreshCw,
  Trash2,
  Link2,
} from "lucide-react";
import CertificateLayoutEditor from "@/components/Events/CertificateLayoutEditor";
import { getDefaultCertificateLayout } from "@/lib/certificate";
import Link from "next/link";
import LinkEventsModal from "@/app/club-admin/certificates/LinkEventsModal";

interface CertificateFormProps {
  initialData?: any;
}

// Custom simple loading spinner component
const SimpleLoader = () => (
  <div className="flex flex-col items-center justify-center p-8 gap-4">
    <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-emerald-500 animate-spin"></div>
    <p className="text-sm font-medium text-slate-500 animate-pulse">Uploading template...</p>
  </div>
);

export default function CertificateForm({ initialData }: CertificateFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [certificateId, setCertificateId] = useState<string | null>(initialData?._id || null);
  const [name, setName] = useState(initialData?.name || "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialData?.url || null);
  const [isDraft, setIsDraft] = useState<boolean>(initialData?.isDraft ?? true);
  const [layout, setLayout] = useState(initialData?.layout || getDefaultCertificateLayout());
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const uploadTemplateAsDraft = async (pickedFile: File) => {
    setIsUploading(true);

    const fallbackName = name.trim() || pickedFile.name.replace(/\.[^/.]+$/, "") || "Untitled Certificate Draft";
    if (!name.trim()) {
      setName(fallbackName);
    }

    const formData = new FormData();
    formData.set("name", fallbackName);
    formData.set("certificateTemplateImage", pickedFile);
    formData.set("isDraft", "true");
    formData.set("certificateLayout", JSON.stringify(layout));

    try {
      const url = certificateId
        ? `/api/club-admin/certificates/${certificateId}`
        : "/api/club-admin/certificates";
      const method = certificateId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to upload template");
        setIsUploading(false);
        return;
      }

      const savedCert = await res.json();

      setIsUploading(false);
      setCertificateId(savedCert._id);
      setPreviewUrl(savedCert.url);
      setIsDraft(true);
      setFile(pickedFile);
      toast.success("Template uploaded!");
      
      // Auto transition to next step after upload success
      setTimeout(() => {
        setCurrentStep(2);
      }, 500);

    } catch (error) {
      setIsUploading(false);
      toast.error("An error occurred during template upload");
    }
  };

  const processFile = (picked?: File) => {
    if (!picked) return;
    if (!picked.type.startsWith("image/")) {
      toast.error("Template must be an image (PNG, JPG, WEBP)");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    if (picked.size > 5 * 1024 * 1024) {
      toast.error("Template must be less than 5MB");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    uploadTemplateAsDraft(picked);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    processFile(picked);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    processFile(droppedFile);
  };

  const handleDeleteDraft = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!certificateId) {
      // Local state cleanup if not uploaded yet
      setFile(null);
      setPreviewUrl(null);
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (!confirm("Are you sure you want to delete this draft? The uploaded image will be permanently removed from Cloudinary.")) {
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch(`/api/club-admin/certificates/${certificateId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete draft");
        return;
      }

      toast.success("Draft deleted and Cloudinary image cleaned up successfully");
      router.push("/club-admin/certificates");
      router.refresh();
    } catch (err) {
      toast.error("Failed to delete draft");
    } finally {
      setDeleting(false);
    }
  };

  const goToStep2 = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter a name for the certificate");
      return;
    }
    if (!previewUrl) {
      toast.error("Please upload a certificate template image");
      return;
    }
    if (isUploading) {
      toast.info("Please wait for the template to finish uploading");
      return;
    }
    setCurrentStep(2);
  };

  const saveCertificate = async (asDraft: boolean = false) => {
    if (!name.trim()) {
      toast.error("Please enter a certificate name");
      setCurrentStep(1);
      return;
    }
    if (!previewUrl) {
      toast.error("Please upload a template image first");
      setCurrentStep(1);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set("name", name.trim());
    formData.set("isDraft", asDraft ? "true" : "false");
    formData.set("certificateLayout", JSON.stringify(layout));

    try {
      const url = certificateId
        ? `/api/club-admin/certificates/${certificateId}`
        : "/api/club-admin/certificates";
      const method = certificateId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to save certificate");
        return;
      }

      toast.success(asDraft ? "Saved as draft!" : "Certificate published successfully!");
      router.push("/club-admin/certificates");
      router.refresh();
    } catch (error) {
      toast.error("An error occurred while saving");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-6rem)] relative overflow-hidden bg-slate-50">
      <AnimatePresence mode="wait" initial={false}>
        {currentStep === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full min-h-[calc(100vh-6rem)] flex flex-col items-center justify-between py-12 px-4 sm:px-6 absolute inset-0 overflow-y-auto"
          >
            {/* Top Navigation */}
            <div className="w-full max-w-4xl flex justify-start mb-8">
              <Link
                href="/club-admin/certificates"
                className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-800 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </Link>
            </div>

            {/* Main Content */}
            <form onSubmit={goToStep2} className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl gap-12">
              
              {/* Header / Name Input */}
              <div className="w-full flex flex-col items-center gap-4 text-center">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Certificate Name..."
                  className="w-full text-center text-4xl sm:text-5xl font-bold text-slate-900 bg-transparent border-none focus:outline-none focus:ring-0 placeholder:text-slate-300 tracking-tight"
                  autoFocus
                />
                <p className="text-lg text-slate-500 font-medium">
                  Upload your background template to begin designing.
                </p>
              </div>

              {/* Central Asset: Dropzone or Preview */}
              <div className="w-full w-max-[600px] flex items-center justify-center">
                {isUploading ? (
                  <div className="w-full max-w-md aspect-[4/3] rounded-[2.5rem] bg-slate-100 flex flex-col items-center justify-center border-2 border-slate-200">
                    <SimpleLoader />
                  </div>
                ) : previewUrl ? (
                  <div className="relative w-full group rounded-[2rem] p-2 bg-white shadow-xl shadow-slate-200/50 border border-slate-100">
                    <div className="relative w-full aspect-[16/9] bg-slate-50 rounded-[1.5rem] overflow-hidden flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Template Preview"
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            fileInputRef.current?.click();
                          }}
                          className="flex items-center gap-2 px-5 py-3 bg-white/90 text-slate-800 rounded-full hover:bg-white transition-colors shadow-lg font-medium text-sm"
                        >
                          <RefreshCw className="w-4 h-4" /> Replace
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeleteDraft(e);
                          }}
                          disabled={deleting}
                          className="flex items-center gap-2 px-5 py-3 bg-red-500/90 text-white rounded-full hover:bg-red-500 transition-colors shadow-lg font-medium text-sm"
                        >
                          {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`w-full max-w-md aspect-[4/3] rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer transition-all duration-300 border-2 ${
                      isDragging
                        ? "border-emerald-400 bg-emerald-50 scale-[0.98]"
                        : "border-slate-200 hover:border-slate-300 hover:bg-white bg-slate-100/50"
                    }`}
                  >
                    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-105 transition-transform duration-300">
                      <Upload className="w-8 h-8 text-slate-400" />
                    </div>
                    <div className="text-center px-6">
                      <p className="text-xl font-semibold text-slate-700">
                        {isDragging ? "Drop template here" : "Click to upload"}
                      </p>
                      <p className="text-sm text-slate-400 mt-2 font-medium">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {certificateId && (
                <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col gap-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <Link2 className="w-4 h-4 text-[#7CB342]" /> Tie to Club Events
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Associate this certificate template to winners or participants of your club events.
                    </p>
                  </div>
                  <LinkEventsModal
                    certificateId={certificateId}
                    certificateName={name}
                    isDraft={isDraft}
                  />
                </div>
              )}

              {/* Bottom Action */}
              <div className="w-full flex justify-center mt-4">
                <button
                  type="submit"
                  disabled={!name.trim() || !previewUrl || isUploading}
                  className={`px-10 py-4 rounded-full text-base font-semibold transition-all duration-300 shadow-sm ${
                    !name.trim() || !previewUrl || isUploading
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
                  }`}
                >
                  Continue
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full bg-slate-50 overflow-y-auto"
          >
            <div className="w-full max-w-7xl mx-auto py-6 px-4 sm:px-6">
              <CertificateLayoutEditor
                templatePreviewUrl={previewUrl}
                layout={layout}
                onChange={setLayout}
                certificateName={name}
                onSaveDraft={() => saveCertificate(true)}
                onPublish={() => saveCertificate(false)}
                isSaving={loading}
                isDraft={isDraft}
                onBackToUpload={() => setCurrentStep(1)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}


