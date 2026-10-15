"use client";
import React, { useState, useEffect } from "react";
import OverviewTab from "@/components/FacultyCoordinator/OverviewTab";
import AttendanceTab from "@/components/FacultyCoordinator/AttendanceTab";
import NaacAuditReportTab from "@/components/FacultyCoordinator/NaacAuditReportTab";
import StudentPerformanceTab from "@/components/FacultyCoordinator/StudentPerformanceTab";
import NotificationFeedTab from "@/components/FacultyCoordinator/NotificationFeedTab";
import { useFacultyTab } from "@/components/FacultyCoordinator/FacultyCoordinatorClientLayout";
import { useAcademicYear } from "@/context/AcademicYearContext";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import { toast } from "sonner";

interface Props {
  user: any;
}

export default function FacultyCoordinatorDashboardClient({ user }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const { activeTab, setActiveTab, preselectedNaacEventId, setPreselectedNaacEventId } =
    useFacultyTab();
  const { academicYear, setAvailableYears } = useAcademicYear();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/faculty-coordinator/dashboard?academicYear=${academicYear}`
      );
      if (!res.ok) throw new Error("Failed to load dashboard data");
      const json = await res.json();
      setData(json);
      if (json.availableAcademicYears) {
        setAvailableYears(json.availableAcademicYears);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [academicYear]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <ClublyLoader />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-white rounded-2xl border border-red-200 p-8 text-center text-red-600">
        <p className="font-bold">Failed to load coordinator data</p>
        <button
          onClick={fetchDashboardData}
          className="mt-3 px-4 py-2 bg-[#7CB342] text-white rounded-xl text-xs font-bold hover:bg-[#689F38] cursor-pointer"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {activeTab === "overview" && (
        <OverviewTab
          data={data}
          onNavigateToNaac={(eventId) => {
            setPreselectedNaacEventId(eventId);
            setActiveTab("naac");
          }}
        />
      )}

      {activeTab === "attendance" && <AttendanceTab />}

      {activeTab === "naac" && (
        <NaacAuditReportTab
          events={data.recentEvents || []}
          preselectedEventId={preselectedNaacEventId}
          coordinatorName={user?.name}
        />
      )}

      {activeTab === "leaderboard" && (
        <StudentPerformanceTab
          clubId={data.club?.id}
          clubName={data.club?.name || "Club"}
        />
      )}

      {activeTab === "notifications" && <NotificationFeedTab />}
    </div>
  );
}
