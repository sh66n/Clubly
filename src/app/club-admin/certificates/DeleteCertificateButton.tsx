"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash, Loader2 } from "lucide-react";

interface DeleteCertificateButtonProps {
  id: string;
  isDraft?: boolean;
}

export default function DeleteCertificateButton({ id, isDraft }: DeleteCertificateButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const promptMessage = isDraft
      ? "Are you sure you want to delete this draft? The uploaded image will be permanently removed from Cloudinary."
      : "Are you sure you want to delete this certificate? It cannot be recovered and the image will be removed from Cloudinary.";

    if (!confirm(promptMessage)) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/club-admin/certificates/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to delete certificate");
        return;
      }

      toast.success(isDraft ? "Draft deleted and Cloudinary image cleaned up" : "Certificate deleted successfully");
      router.refresh();
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="p-1.5 bg-white hover:bg-red-50 border border-slate-200 text-red-600 rounded-lg disabled:opacity-50 transition-all hover:scale-105 shadow-md flex items-center justify-center"
      title={isDraft ? "Delete draft & remove image" : "Delete certificate"}
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash className="w-3.5 h-3.5" />}
    </button>
  );
}

