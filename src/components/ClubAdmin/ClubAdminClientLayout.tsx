"use client";
import React, { useState } from "react";
import ClubAdminSidebar from "@/components/ClubAdmin/ClubAdminSidebar";
import ClubAdminHeader from "@/components/ClubAdmin/ClubAdminHeader";

interface ClubAdminClientLayoutProps {
  user: any;
  children: React.ReactNode;
}

export default function ClubAdminClientLayout({
  user,
  children,
}: ClubAdminClientLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* Sidebar */}
      <ClubAdminSidebar
        user={user}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area */}
      <div className="flex-1 md:ml-[var(--club-admin-sidebar-width,17rem)] transition-all duration-300 flex flex-col min-w-0">
        {/* Top header */}
        <ClubAdminHeader
          user={user}
          onMenuClick={() => setMobileOpen(true)}
        />

        {/* Page content */}
        <main className="flex-1 px-4 md:px-6 pt-6 pb-6">{children}</main>
      </div>
    </div>
  );
}
