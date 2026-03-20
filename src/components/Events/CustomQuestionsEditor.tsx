"use client";

import { Plus, Trash2 } from "lucide-react";

export type CustomQuestion = {
  id: string;
  question: string;
  type: "text" | "select" | "multiselect";
  required: boolean;
  options: string[];
};

interface CustomQuestionsEditorProps {
  value: CustomQuestion[];
  onChange: (next: CustomQuestion[]) => void;
  className?: string;
}

export const normalizeCustomQuestions = (
  questions: CustomQuestion[],
): CustomQuestion[] =>
  questions
    .map((question) => {
      const normalizedType = question.type;
      const normalizedOptions =
        normalizedType === "text"
          ? []
          : (question.options ?? [])
              .map((option) => option.trim())
              .filter((option) => option.length > 0);

      return {
        id: question.id.trim(),
        question: question.question.trim(),
        type: normalizedType,
        required: Boolean(question.required),
        options: normalizedOptions,
      };
    })
    .filter((question) => question.id.length > 0 && question.question.length > 0);

const generateQuestionId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

export default function CustomQuestionsEditor({
  value,
  onChange,
  className,
}: CustomQuestionsEditorProps) {
  const addQuestion = () => {
    onChange([
      ...value,
      {
        id: generateQuestionId(),
        question: "",
        type: "text",
        required: false,
        options: [],
      },
    ]);
  };

  const updateQuestion = (index: number, updates: Partial<CustomQuestion>) => {
    const next = [...value];
    next[index] = { ...next[index], ...updates };
    onChange(next);
  };

  const removeQuestion = (index: number) => {
    onChange(value.filter((_, idx) => idx !== index));
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-300">Custom Questions</h3>
        <button
          type="button"
          onClick={addQuestion}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-700 text-sm text-gray-300 hover:text-white hover:border-gray-500 transition-colors"
        >
          <Plus size={14} />
          Add question
        </button>
      </div>

      <div className="space-y-3">
        {value.length === 0 && (
          <div className="text-xs text-gray-500 border border-dashed border-gray-700 rounded-lg p-3">
            No custom questions added.
          </div>
        )}

        {value.map((question, index) => (
          <div
            key={question.id}
            className="rounded-lg border border-gray-700 bg-gray-800/40 p-3 space-y-3"
          >
            <div className="flex gap-2">
              <input
                value={question.question}
                onChange={(e) =>
                  updateQuestion(index, { question: e.target.value })
                }
                placeholder="Question text"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeQuestion(index)}
                className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-red-400 hover:border-red-500 transition-colors"
                aria-label="Remove question"
              >
                <Trash2 size={15} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <select
                value={question.type}
                onChange={(e) =>
                  updateQuestion(index, {
                    type: e.target.value as CustomQuestion["type"],
                    options:
                      e.target.value === "text" ? [] : question.options ?? [],
                  })
                }
                className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200"
              >
                <option value="text">Text</option>
                <option value="select">Select</option>
                <option value="multiselect">Multi-select</option>
              </select>

              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={question.required}
                  onChange={(e) =>
                    updateQuestion(index, { required: e.target.checked })
                  }
                />
                Required
              </label>
            </div>

            {question.type !== "text" && (
              <input
                value={question.options.join(", ")}
                onChange={(e) =>
                  updateQuestion(index, {
                    options: e.target.value
                      .split(",")
                      .map((option) => option.trim()),
                  })
                }
                placeholder="Options (comma separated)"
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-200 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
