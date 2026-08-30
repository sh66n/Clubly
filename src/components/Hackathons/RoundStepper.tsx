"use client";

import React from "react";
import { Check, Clock, Lock, Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface Round {
  _id: string;
  name: string;
  status: "upcoming" | "active" | "evaluating" | "completed";
  roundNumber: number;
}

interface RoundStepperProps {
  rounds: Round[];
  currentRoundId?: string;
}

export default function RoundStepper({ rounds, currentRoundId }: RoundStepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center w-full relative">
        {rounds.map((round, index) => {
          const isLast = index === rounds.length - 1;
          const isActive = round._id === currentRoundId || round.status === "active";
          const isCompleted = round.status === "completed";
          const isEvaluating = round.status === "evaluating";
          
          return (
            <React.Fragment key={round._id}>
              {/* Step Circle & Content */}
              <div className="flex flex-col items-center relative z-10 w-full">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white transition-colors duration-300",
                    isCompleted && "border-green-500 text-green-500",
                    isEvaluating && "border-yellow-500 text-yellow-500",
                    isActive && "border-blue-600 text-blue-600 ring-4 ring-blue-50",
                    round.status === "upcoming" && "border-gray-300 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : isActive ? (
                    <Play className="w-5 h-5" />
                  ) : isEvaluating ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>
                <div className="mt-3 text-center">
                  <p className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-gray-900" : "text-gray-600"
                  )}>
                    {round.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize mt-0.5">
                    {round.status}
                  </p>
                </div>
              </div>

              {/* Connecting Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 absolute top-5 left-[50%] right-[-50%] -z-10">
                  <div
                    className={cn(
                      "h-full w-full transition-colors duration-500",
                      (isCompleted || isEvaluating) ? "bg-green-500" : "bg-gray-200"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
