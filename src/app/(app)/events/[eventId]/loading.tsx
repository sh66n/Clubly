"use client";

import BorderedDiv from "@/components/BorderedDiv";
import React from "react";

export default function Loading() {
  return (
    <div className="flex relative animate-pulse">
      {/* LEFT SECTION (70%) */}
      <div className="w-[70%] space-y-6">
        {/* Event Header */}
        <BorderedDiv className="p-4">
          <div className="flex flex-col gap-4">
            <div className="h-20 w-20 rounded-full bg-gray-800" />
            <div className="h-8 w-2/3 bg-gray-800 rounded" />
            <div className="flex gap-2 items-center text-[#717171]">
              <div className="h-5 w-5 bg-gray-800 rounded" />
              <div className="h-4 w-1/3 bg-gray-800 rounded" />
            </div>
            <div className="flex gap-2 items-center text-[#717171]">
              <div className="h-5 w-5 bg-gray-800 rounded" />
              <div className="h-4 w-1/4 bg-gray-800 rounded" />
            </div>
          </div>
        </BorderedDiv>

        {/* Rewards */}
        <section>
          <div className="h-6 w-48 mb-2 bg-gray-800 rounded" />
          <BorderedDiv className="flex flex-col gap-4 p-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-800 rounded-lg" />
                <div className="h-4 w-1/3 bg-gray-800 rounded" />
              </div>
            ))}
          </BorderedDiv>
        </section>

        {/* Registration Deadline */}
        <section>
          <div className="h-6 w-48 mb-2 bg-gray-800 rounded" />
          <BorderedDiv className="p-4 flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-800 rounded-lg" />
            <div className="h-4 w-1/3 bg-gray-800 rounded" />
          </BorderedDiv>
        </section>

        {/* Details */}
        <section>
          <div className="h-6 w-48 mb-2 bg-gray-800 rounded" />
          <BorderedDiv className="p-4 space-y-2">
            <div className="h-4 w-full bg-gray-800 rounded" />
            <div className="h-4 w-5/6 bg-gray-800 rounded" />
            <div className="h-4 w-2/3 bg-gray-800 rounded" />
          </BorderedDiv>
        </section>

        {/* Points */}
        <section>
          <div className="h-6 w-48 mb-2 bg-gray-800 rounded" />
          <BorderedDiv className="flex flex-col gap-4 p-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-8 w-8 bg-gray-800 rounded-lg" />
                <div className="h-4 w-1/3 bg-gray-800 rounded" />
              </div>
            ))}
          </BorderedDiv>
        </section>
      </div>

      {/* RIGHT STICKY CARD */}
      <div className="grow ml-4 pb-4">
        <div className="flex flex-col gap-4 sticky top-2">
          <BorderedDiv className="rounded-xl shadow-md p-4 space-y-4">
            <div className="h-8 w-1/2 bg-gray-800 rounded" />
            <div className="h-10 w-full bg-gray-800 rounded" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-800 rounded-lg" />
              <div className="h-4 w-1/3 bg-gray-800 rounded" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-gray-800 rounded-lg" />
              <div className="h-4 w-1/3 bg-gray-800 rounded" />
            </div>
          </BorderedDiv>

          {/* Placeholder for group card */}
          <BorderedDiv className="p-4 space-y-3">
            <div className="h-6 w-1/2 bg-gray-800 rounded" />
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-900 flex gap-2 items-center p-2 rounded-lg"
              >
                <div className="h-8 w-8 rounded-full bg-gray-800" />
                <div className="h-4 w-1/3 bg-gray-800 rounded" />
              </div>
            ))}
          </BorderedDiv>
        </div>
      </div>
    </div>
  );
}
