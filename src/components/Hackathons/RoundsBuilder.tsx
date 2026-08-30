"use client";

import React, { useState } from "react";
import { Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";

export interface Round {
  id: string;
  name: string;
  description: string;
  registrationFee: number;
  requiresSubmission: boolean;
  submissionDeadline: string;
  resultDate: string;
  submissionInstructions: string;
}

interface RoundsBuilderProps {
  rounds: Round[];
  onChange: (rounds: Round[]) => void;
}

export function RoundsBuilder({ rounds, onChange }: RoundsBuilderProps) {
  const [expandedRound, setExpandedRound] = useState<string | null>(null);

  const addRound = () => {
    const newRound: Round = {
      id: Math.random().toString(36).substring(7),
      name: `Round ${rounds.length + 1}`,
      description: "",
      registrationFee: 0,
      requiresSubmission: false,
      submissionDeadline: "",
      resultDate: "",
      submissionInstructions: "",
    };
    onChange([...rounds, newRound]);
    setExpandedRound(newRound.id);
  };

  const updateRound = (id: string, field: keyof Round, value: any) => {
    onChange(
      rounds.map((round) =>
        round.id === id ? { ...round, [field]: value } : round
      )
    );
  };

  const removeRound = (id: string) => {
    onChange(rounds.filter((round) => round.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Hackathon Rounds</h3>
        <button
          type="button"
          onClick={addRound}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          <Plus size={16} /> Add Round
        </button>
      </div>

      {rounds.length === 0 && (
        <p className="text-gray-500 text-sm italic">No rounds added yet. Add at least one round.</p>
      )}

      <div className="space-y-4">
        {rounds.map((round, index) => {
          const isExpanded = expandedRound === round.id;

          return (
            <div key={round.id} className="border rounded-md overflow-hidden bg-white shadow-sm">
              <div
                className="flex justify-between items-center p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition"
                onClick={() => setExpandedRound(isExpanded ? null : round.id)}
              >
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-gray-700">Round {index + 1}: {round.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRound(round.id);
                    }}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md transition"
                  >
                    <Trash2 size={16} />
                  </button>
                  {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>

              {isExpanded && (
                <div className="p-4 space-y-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={round.name}
                        onChange={(e) => updateRound(round.id, "name", e.target.value)}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="E.g., Ideation Phase"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Registration Fee (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={round.registrationFee}
                        onChange={(e) => updateRound(round.id, "registrationFee", Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={round.description}
                      onChange={(e) => updateRound(round.id, "description", e.target.value)}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="Describe what participants need to do in this round..."
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={`req-sub-${round.id}`}
                      checked={round.requiresSubmission}
                      onChange={(e) => updateRound(round.id, "requiresSubmission", e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`req-sub-${round.id}`} className="text-sm font-medium text-gray-700">
                      Requires Submission
                    </label>
                  </div>

                  {round.requiresSubmission && (
                    <div className="space-y-4 bg-blue-50 p-4 rounded-md border border-blue-100 mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Submission Deadline</label>
                          <input
                            type="datetime-local"
                            value={round.submissionDeadline}
                            onChange={(e) => updateRound(round.id, "submissionDeadline", e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Result Date</label>
                          <input
                            type="datetime-local"
                            value={round.resultDate}
                            onChange={(e) => updateRound(round.id, "resultDate", e.target.value)}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Submission Instructions</label>
                        <textarea
                          value={round.submissionInstructions}
                          onChange={(e) => updateRound(round.id, "submissionInstructions", e.target.value)}
                          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                          rows={2}
                          placeholder="E.g., Upload your pitch deck in PDF format..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
