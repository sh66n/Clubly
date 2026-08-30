"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Upload, CheckCircle2, XCircle, Clock } from "lucide-react";
// Assumes SubmissionUploader & RoundStepper exist or we provide basic fallbacks if they don't

interface HackathonDashboardProps {
  hackathon: any;
  team: any;
}

export function HackathonDashboard({ hackathon, team }: HackathonDashboardProps) {
  const [isPaying, setIsPaying] = useState(false);

  // Determine current active round based on team status or dates
  // For simplicity, assume team.currentRoundIndex
  const currentRoundIndex = team?.currentRoundIndex || 0;
  const currentRound = hackathon?.rounds?.[currentRoundIndex];

  const handlePayment = async () => {
    try {
      setIsPaying(true);
      // Integration with Razorpay checkout would go here
      // For now, simulate success
      await new Promise(r => setTimeout(r, 1000));
      toast.success("Payment successful!");
    } catch (error) {
      toast.error("Payment failed");
    } finally {
      setIsPaying(false);
    }
  };

  if (!hackathon || !team) return null;

  return (
    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
      <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Team Dashboard</h2>
          <p className="text-sm text-gray-500">Team: {team.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {team.status === "QUALIFIED" && <span className="flex items-center gap-1 text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium"><CheckCircle2 size={16} /> Qualified</span>}
          {team.status === "ELIMINATED" && <span className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full text-sm font-medium"><XCircle size={16} /> Eliminated</span>}
          {team.status === "PENDING" && <span className="flex items-center gap-1 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full text-sm font-medium"><Clock size={16} /> Pending Review</span>}
        </div>
      </div>

      <div className="p-6">
        {/* Placeholder for RoundStepper */}
        <div className="mb-8 flex items-center justify-between">
          {hackathon.rounds?.map((r: any, idx: number) => (
            <div key={idx} className={`flex-1 text-center border-b-2 pb-2 ${idx <= currentRoundIndex ? 'border-blue-600 text-blue-600 font-medium' : 'border-gray-200 text-gray-400'}`}>
              Round {idx + 1}
            </div>
          ))}
        </div>

        {currentRound && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">{currentRound.name}</h3>
              <p className="text-gray-600">{currentRound.description}</p>
            </div>

            {currentRound.registrationFee > 0 && !team.hasPaidForRound && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-blue-900">Payment Required</h4>
                  <p className="text-sm text-blue-700">Fee for this round: ₹{currentRound.registrationFee}</p>
                </div>
                <button
                  onClick={handlePayment}
                  disabled={isPaying}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                >
                  {isPaying ? "Processing..." : `Pay ₹${currentRound.registrationFee}`}
                </button>
              </div>
            )}

            {currentRound.requiresSubmission && (
              <div className="border rounded-lg p-6 bg-gray-50">
                <h4 className="font-semibold mb-2">Submit Your Work</h4>
                <p className="text-sm text-gray-600 mb-4">{currentRound.submissionInstructions}</p>
                
                {/* Fallback submission uploader */}
                <div className="border-2 border-dashed border-gray-300 bg-white rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition">
                  <Upload className="text-gray-400 mb-3" size={32} />
                  <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Allowed: {hackathon.allowedFormats || "Any"} (Max {hackathon.maxFileSize || 10}MB)
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
