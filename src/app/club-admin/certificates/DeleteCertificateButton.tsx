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
      className="p-2 bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 rounded-lg disabled:opacity-50 transition-colors"
      title={isDraft ? "Delete draft & remove image" : "Delete certificate"}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
    </button>
  );
}

