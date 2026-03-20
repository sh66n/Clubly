"use client";

import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";

type CustomQuestion = {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect";
  required: boolean;
  options?: string[];
};

type CustomQuestionAnswer = {
  questionId: string;
  answer: string | string[];
};

interface RegistrationQuestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  questions: CustomQuestion[];
  onSubmit: (answers: CustomQuestionAnswer[]) => Promise<void>;
  isSubmitting: boolean;
}

export default function RegistrationQuestionsModal({
  isOpen,
  onClose,
  questions,
  onSubmit,
  isSubmitting,
}: RegistrationQuestionsModalProps) {
  const [mounted, setMounted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setAnswers({});
    }
  }, [isOpen]);

  const answerPayload = useMemo(
    () =>
      questions
        .map((question) => {
          const answer = answers[question.id];
          if (
            answer === undefined ||
            answer === null ||
            (typeof answer === "string" && answer.trim() === "") ||
            (Array.isArray(answer) && answer.length === 0)
          ) {
            return null;
          }
          return { questionId: question.id, answer };
        })
        .filter((item): item is CustomQuestionAnswer => Boolean(item)),
    [answers, questions],
  );

  const handleSubmit = async () => {
    const missingRequired = questions.find((question) => {
      if (!question.required) return false;
      const answer = answers[question.id];
      return (
        answer === undefined ||
        answer === null ||
        (typeof answer === "string" && answer.trim() === "") ||
        (Array.isArray(answer) && answer.length === 0)
      );
    });

    if (missingRequired) {
      toast.error(`Please answer: ${missingRequired.question}`);
      return;
    }

    await onSubmit(answerPayload);
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
          />

          <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 sm:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="w-full max-w-2xl bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/[0.02]">
                <div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">
                    Before you register
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Please answer the organizer&apos;s questions
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-black space-y-5">
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-3"
                  >
                    <label className="text-sm font-medium text-gray-100 block">
                      {index + 1}. {question.question}
                      {question.required && <span className="text-red-400"> *</span>}
                    </label>

                    {question.type === "text" && (
                      <input
                        value={String(answers[question.id] ?? "")}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    )}

                    {question.type === "select" && (
                      <select
                        value={String(answers[question.id] ?? "")}
                        onChange={(e) =>
                          setAnswers((prev) => ({
                            ...prev,
                            [question.id]: e.target.value,
                          }))
                        }
                        className="w-full rounded-xl border border-gray-700 bg-gray-900 px-3 py-2.5 text-sm text-gray-200 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        <option value="">Select an option</option>
                        {(question.options ?? []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    )}

                    {question.type === "multiselect" && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {(question.options ?? []).map((option) => {
                          const selectedValues = Array.isArray(answers[question.id])
                            ? (answers[question.id] as string[])
                            : [];
                          const checked = selectedValues.includes(option);
                          return (
                            <label
                              key={option}
                              className="flex items-center gap-2 rounded-xl border border-gray-700 px-3 py-2.5 text-sm text-gray-300 bg-gray-900/40 hover:border-gray-500 transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  const previous = Array.isArray(answers[question.id])
                                    ? [...(answers[question.id] as string[])]
                                    : [];
                                  const next = e.target.checked
                                    ? [...previous, option]
                                    : previous.filter((value) => value !== option);
                                  setAnswers((prev) => ({
                                    ...prev,
                                    [question.id]: next,
                                  }));
                                }}
                              />
                              {option}
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2 p-5 border-t border-white/5 bg-white/[0.02]">
                <button
                  onClick={onClose}
                  className="px-4 py-2 rounded-full text-sm font-semibold bg-white/10 text-gray-300 hover:bg-white/15 hover:text-white transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-5 py-2 rounded-full text-sm font-semibold bg-white text-black hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Continue"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
