"use client";
import React, { createContext, useContext, useState } from "react";
import FacultyCoordinatorSidebar, {
  FacultyTabKey,
} from "@/components/FacultyCoordinator/FacultyCoordinatorSidebar";
import FacultyCoordinatorHeader from "@/components/FacultyCoordinator/FacultyCoordinatorHeader";
import { AcademicYearProvider } from "@/context/AcademicYearContext";

interface FacultyTabContextType {
  activeTab: FacultyTabKey;
  setActiveTab: (tab: FacultyTabKey) => void;
  preselectedNaacEventId: string;
  setPreselectedNaacEventId: (eventId: string) => void;
}

const FacultyTabContext = createContext<FacultyTabContextType>({
  activeTab: "overview",
  setActiveTab: () => {},
  preselectedNaacEventId: "",
  setPreselectedNaacEventId: () => {},
});

export const useFacultyTab = () => useContext(FacultyTabContext);

interface FacultyCoordinatorClientLayoutProps {
  user: any;
  children: React.ReactNode;
}

export default function FacultyCoordinatorClientLayout({
  user,
  children,
}: FacultyCoordinatorClientLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<FacultyTabKey>("overview");
  const [preselectedNaacEventId, setPreselectedNaacEventId] = useState<string>("");

  return (
    <AcademicYearProvider>
      <FacultyTabContext.Provider
        value={{
          activeTab,
          setActiveTab,
          preselectedNaacEventId,
          setPreselectedNaacEventId,
        }}
      >
        <div className="flex min-h-screen bg-[#f5f5f5]">
          {/* Sidebar */}
          <FacultyCoordinatorSidebar
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            mobileOpen={mobileOpen}
            onMobileClose={() => setMobileOpen(false)}
          />

          {/* Main area */}
          <div className="flex-1 md:ml-[var(--faculty-sidebar-width,17rem)] transition-all duration-300 flex flex-col min-w-0">
            {/* Header */}
            <FacultyCoordinatorHeader
              user={user}
              onMenuClick={() => setMobileOpen(true)}
            />

            {/* Page content */}
            <main className="flex-1 px-4 md:px-6 pt-6 pb-6">{children}</main>
          </div>
        </div>
      </FacultyTabContext.Provider>
    </AcademicYearProvider>
  );
}
