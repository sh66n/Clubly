"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Reorder } from "framer-motion";
import { v4 as uuidv4 } from "uuid";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";

export interface IFeedbackQuestionInput {
  id: string;
  text: string;
  required: boolean;
}

interface FeedbackFormEditorProps {
  formId?: string;
}

export default function FeedbackFormEditor({ formId }: FeedbackFormEditorProps) {
  const router = useRouter();
  const isEditing = !!formId;
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [questions, setQuestions] = useState<IFeedbackQuestionInput[]>([
    { id: uuidv4(), text: "", required: true },
  ]);
  const [linkedEvents, setLinkedEvents] = useState<any[]>([]);

  useEffect(() => {
    if (isEditing) {
      fetchForm();
    }
  }, [formId]);

  const fetchForm = async () => {
    try {
      const res = await fetch(`/api/club-admin/feedback-forms/${formId}`);
      if (!res.ok) throw new Error("Failed to fetch form");
      const data = await res.json();
      setName(data.form.name || "");
      if (data.form.questions && data.form.questions.length > 0) {
        setQuestions(data.form.questions);
      }
      if (data.linkedEvents) {
        setLinkedEvents(data.linkedEvents);
      }
    } catch (err: any) {
      toast.error(err.message);
      router.push("/club-admin/feedback-forms");
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { id: uuidv4(), text: "", required: true }]);
  };

  const handleRemoveQuestion = (id: string) => {
    if (questions.length <= 1) {
      toast.error("Form must have at least one question");
      return;
    }
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleUpdateQuestion = (id: string, field: keyof IFeedbackQuestionInput, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a form name");
      return;
    }

    const invalidQuestions = questions.some((q) => !q.text.trim());
    if (invalidQuestions) {
      toast.error("All questions must have text");
      return;
    }

    setSaving(true);
    try {
      const url = isEditing
        ? `/api/club-admin/feedback-forms/${formId}`
        : "/api/club-admin/feedback-forms";
      
      const res = await fetch(url, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, questions }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save form");
      }

      toast.success(isEditing ? "Form updated successfully" : "Form created successfully");
      router.push("/club-admin/feedback-forms");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setSaving(false);
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
    <div className="p-8 pb-32 xl:p-16 max-w-4xl mx-auto min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link
            href="/club-admin/feedback-forms"
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-4 text-sm font-medium w-fit"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Forms
          </Link>
          <h1 className="text-3xl font-bold text-white">
            {isEditing ? "Edit Form" : "Create Feedback Form"}
          </h1>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-all shadow-lg shadow-blue-900/20"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? "Saving..." : "Save Form"}
        </button>
      </div>
      
      {linkedEvents.length > 0 && (
        <div className="mb-8 p-4 rounded-2xl bg-yellow-900/20 border border-yellow-900/50 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-yellow-500 font-medium mb-1">Form is in use</h4>
            <p className="text-yellow-500/80 text-sm">
              This form is linked to {linkedEvents.length} event(s) ({linkedEvents.map(e => e.name).join(", ")}). 
              Changes here will affect new feedbacks. If any feedback is already submitted using this form, you won't be able to edit it.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Form Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Hackathon Feedback"
            className="w-full bg-gray-950/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">Questions</h2>
              <p className="text-sm text-gray-400">
                Add questions for users to rate from 1 to 5 stars.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <Reorder.Group axis="y" values={questions} onReorder={setQuestions}>
              {questions.map((question) => (
                <Reorder.Item
                  key={question.id}
                  value={question}
                  className="bg-gray-950/50 border border-gray-800 rounded-2xl p-4 mb-4 flex items-start gap-4 group cursor-default"
                >
                  <div className="mt-2 text-gray-600 hover:text-gray-400 cursor-grab active:cursor-grabbing transition-colors">
                    <GripVertical className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div>
                      <input
                        type="text"
                        value={question.text}
                        onChange={(e) =>
                          handleUpdateQuestion(question.id, "text", e.target.value)
                        }
                        placeholder="e.g. How would you rate the venue?"
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mt-1">
                    <button
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove Question"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>

          <button
            onClick={handleAddQuestion}
            className="w-full mt-2 py-4 border-2 border-dashed border-gray-800 hover:border-gray-700 hover:bg-gray-800/50 rounded-2xl flex items-center justify-center gap-2 text-gray-400 hover:text-white transition-all font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>
        </div>
      </div>
    </div>
  );
}
