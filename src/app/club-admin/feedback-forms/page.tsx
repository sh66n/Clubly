"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ListTodo, FileText, Loader2, Link2, Trash2, Edit } from "lucide-react";
import { toast } from "sonner";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";

export default function FeedbackFormsPage() {
  const [forms, setForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchForms = async () => {
    try {
      const res = await fetch("/api/club-admin/feedback-forms");
      if (!res.ok) throw new Error("Failed to load forms");
      const data = await res.json();
      setForms(data.forms || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this form?")) return;
    try {
      const res = await fetch(`/api/club-admin/feedback-forms/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete form");
      }
      toast.success("Form deleted successfully");
      fetchForms();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <ClublyLoader />
      </div>
    );
  }

  return (
    <div className="p-8 pb-32 xl:p-16 h-full max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
            Feedback Forms
          </h1>
          <p className="text-gray-400">
            Create and manage feedback forms for your events
          </p>
        </div>
        <Link
          href="/club-admin/feedback-forms/new"
          className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-colors font-medium shadow-lg shadow-blue-900/20"
        >
          <Plus size={18} />
          <span>New Form</span>
        </Link>
      </div>

      {forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-4 rounded-3xl border border-dashed border-gray-800 bg-gray-900/30">
          <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <ListTodo className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Forms Found
          </h3>
          <p className="text-gray-400 text-center max-w-sm mb-6">
            Create reusable feedback forms to collect structured star-ratings from participants.
          </p>
          <Link
            href="/club-admin/feedback-forms/new"
            className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
          >
            Create Your First Form
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {forms.map((form) => (
            <div
              key={form._id}
              className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6 hover:border-gray-700 transition-colors flex flex-col h-full"
            >
              <div className="flex-1">
                <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                  {form.name}
                </h3>
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                  <FileText className="w-4 h-4" />
                  <span>{form.questions?.length || 0} Questions</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-gray-800 flex items-center justify-between mt-auto">
                <Link
                  href={`/club-admin/feedback-forms/${form._id}`}
                  className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" /> Edit Form
                </Link>
                <button
                  onClick={() => handleDelete(form._id)}
                  className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                  title="Delete Form"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
