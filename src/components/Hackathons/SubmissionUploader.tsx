"use client";

import React, { useState, useRef } from "react";
import { UploadCloud, X, File, AlertCircle, CheckCircle, Download, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";

interface SubmissionUploaderProps {
  hackathonId: string;
  roundId: string;
  teamId?: string;
  templateUrl?: string;
  maxFileSizeMB?: number;
  allowedFormats?: string[];
  deadline?: Date | string;
  existingSubmission?: any;
}

export default function SubmissionUploader({
  hackathonId,
  roundId,
  teamId,
  templateUrl,
  maxFileSizeMB = 20,
  allowedFormats = ["pdf", "pptx"],
  deadline,
  existingSubmission,
}: SubmissionUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [submission, setSubmission] = useState<any>(existingSubmission);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formattedExtensions = allowedFormats.map((f) => (f.startsWith(".") ? f : `.${f}`));

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const validateFile = (selectedFile: File) => {
    const ext = "." + selectedFile.name.split(".").pop()?.toLowerCase();
    if (!formattedExtensions.includes(ext) && !allowedFormats.includes("*")) {
      toast.error(`Invalid format. Allowed formats: ${formattedExtensions.join(", ")}`);
      return false;
    }
    if (selectedFile.size > maxFileSizeMB * 1024 * 1024) {
      toast.error(`File too large. Max size is ${maxFileSizeMB}MB`);
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/hackathons/${hackathonId}/rounds/${roundId}/submissions`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to upload submission");
      }

      const data = await res.json();
      setSubmission(data);
      setFile(null);
      toast.success("Presentation submitted successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to upload submission");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white">Project Presentation</h4>
          <p className="text-xs text-gray-400">Upload your PPT according to the format</p>
        </div>
        {templateUrl && (
          <a
            href={templateUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-[#7CB342] hover:text-[#689f38] bg-[#7CB342]/10 border border-[#7CB342]/20 px-2.5 py-1 rounded-lg transition-colors font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Template
          </a>
        )}
      </div>

      {!file && !submission ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all",
            isDragging
              ? "border-[#7CB342] bg-[#7CB342]/10"
              : "border-gray-700 hover:border-gray-500 bg-[#121212]"
          )}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={formattedExtensions.join(",")}
          />
          <UploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-xs font-semibold text-gray-200 mb-1">
            Click to upload or drag and drop PPT / PDF
          </p>
          <p className="text-[11px] text-gray-400">
            {formattedExtensions.join(", ")} (Max {maxFileSizeMB}MB)
          </p>
        </div>
      ) : file ? (
        <div className="border border-gray-700 rounded-xl p-3.5 flex items-center justify-between bg-[#121212]">
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <File className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="font-semibold text-white text-xs truncate">{file.name}</p>
              <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <button
            onClick={() => setFile(null)}
            className="p-1.5 text-gray-400 hover:text-red-400 transition rounded-lg hover:bg-gray-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="border border-green-500/30 bg-green-500/10 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
            <div className="truncate">
              <p className="font-semibold text-green-300 text-xs truncate">
                {submission.fileName || "Presentation Uploaded"}
              </p>
              <p className="text-[10px] text-green-400">
                {submission.version ? `v${submission.version} • ` : ""}Submitted on{" "}
                {format(new Date(submission.submittedAt || Date.now()), "dd MMM yyyy")}
              </p>
            </div>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-green-400 hover:text-green-300 underline"
          >
            Re-upload
          </button>
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept={formattedExtensions.join(",")}
          />
        </div>
      )}

      {file && (
        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className="w-full bg-[#7CB342] text-white font-bold py-2 rounded-xl hover:bg-[#689f38] transition disabled:opacity-50 text-xs flex items-center justify-center gap-2"
        >
          {isUploading && <Loader2 size={14} className="animate-spin" />}
          {isUploading ? "Uploading to Cloud..." : "Confirm & Submit Presentation"}
        </button>
      )}

      {deadline && (
        <div className="flex items-center gap-2 text-xs text-gray-400 bg-black/40 p-2.5 rounded-lg border border-gray-800">
          <AlertCircle className="w-3.5 h-3.5 text-orange-400" />
          <span>Deadline: {format(new Date(deadline), "dd MMM yyyy, hh:mm a")}</span>
        </div>
      )}
    </div>
  );
}
