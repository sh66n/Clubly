"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import HackathonAdminPanel from "@/components/Hackathons/Admin/HackathonAdminPanel";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HackathonAdminDetailsPage() {
  const params = useParams();
  const hackathonId = params.id as string;
  const router = useRouter();

  const [data, setData] = useState<{ hackathon: any, rounds: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/hackathons/${hackathonId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch hackathon details");
      }
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [hackathonId]);

  useEffect(() => {
    if (hackathonId && hackathonId !== 'new') {
      fetchDetails();
    } else {
      setLoading(false);
    }
  }, [hackathonId, fetchDetails]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ClublyLoader />
      </div>
    );
  }

  if (error || (!data && hackathonId !== 'new')) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error: {error || "Hackathon not found"}</p>
        <Link href="/club-admin/hackathons" className="text-blue-500 underline mt-4 inline-block">Back to Hackathons</Link>
      </div>
    );
  }

  if (hackathonId === 'new') {
    return (
      <div className="p-6">
        <Link href="/club-admin/hackathons" className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-6 font-medium text-sm">
          <ArrowLeft size={16} /> Back to Hackathons
        </Link>
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm max-w-3xl">
          <h1 className="text-2xl font-bold text-slate-800 mb-4">Create New Hackathon</h1>
          <p className="text-slate-500 mb-6">Initial form to create a hackathon (Coming Soon)...</p>
          {/* Note: In a complete flow, this would render a creation form, then redirect to the detail view */}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc]">
      <div className="px-6 py-3 border-b border-slate-200 bg-white">
        <Link href="/club-admin/hackathons" className="flex w-max items-center gap-2 text-slate-500 hover:text-[#7CB342] font-medium text-sm transition">
          <ArrowLeft size={16} /> Back to Hackathons
        </Link>
      </div>
      <div className="flex-1 overflow-hidden">
        <HackathonAdminPanel 
          hackathon={data!.hackathon} 
          rounds={data!.rounds} 
          fetchDetails={fetchDetails} 
        />
      </div>
    </div>
  );
}
