"use client";

import React from "react";
import StudentSidebar from "./StudentSidebar";
import StudentStatsAndBadges from "./StudentStatsAndBadges";
import StudentStreakCardPopup from "./StudentStreakCardPopup";
import StudentActivityHeatmap from "./StudentActivityHeatmap";
import StudentActivityList from "./StudentActivityList";
import { GamificationStats } from "@/lib/gamification";
import { StudentBadgeItem } from "@/services/getUserBadges";
import { UserCertificateItem } from "@/services/getUserCertificates";
import { StudentSocialStats } from "@/services/getUserSocialNetwork";
import { ActivityHeatmapDay, StudentActivityItem } from "@/services/getUserActivity";
import { StudentProfileStreakCardData } from "@/services/getUserProfileStreakCard";

interface ProfileClientProps {
  user: any;
  gamification: GamificationStats;
  badges: StudentBadgeItem[];
  certificates: UserCertificateItem[];
  socialStats: StudentSocialStats;
  eventsAttended: number;
  activityData: {
    recentActivities: StudentActivityItem[];
    heatmapDays: ActivityHeatmapDay[];
    totalActiveEvents: number;
    maxStreak: number;
    technicalEventsCount: number;
    culturalEventsCount: number;
    sportsEventsCount: number;
    totalCollegeEvents?: number;
  };
  globalRank: number | string;
  currentUserId?: string;
  streakCardData: StudentProfileStreakCardData | null;
}

export default function ProfileClient({
  user,
  gamification,
  badges,
  certificates,
  socialStats,
  eventsAttended,
  activityData,
  globalRank,
  currentUserId,
  streakCardData,
}: ProfileClientProps) {
  return (
    <div className="w-full max-w-[1240px] mx-auto py-2 px-1 sm:px-2 relative">
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {/* LEFT COLUMN: Student Profile & Bio Sidebar */}
        <StudentSidebar
          user={user}
          globalRank={globalRank}
          socialStats={socialStats}
          currentUserId={currentUserId}
          eventsCount={eventsAttended}
          totalPoints={gamification.totalPoints}
          badgesCount={badges.filter((b) => b.unlocked).length}
        />

        {/* RIGHT COLUMN: Rating, Gauge, Badges, Heatmap, and Activity History */}
        <div className="flex-1 w-full space-y-4">
          {/* XP Rating + Participation Breakdown + 3D Event Badges */}
          <StudentStatsAndBadges
            totalPoints={gamification.totalPoints}
            globalRank={globalRank}
            attendedEvents={eventsAttended}
            badges={badges}
            level={gamification.level}
            rankTier={gamification.rankTier}
            totalCollegeEvents={activityData.totalCollegeEvents}
            technicalCount={activityData.technicalEventsCount}
            culturalCount={activityData.culturalEventsCount}
            sportsCount={activityData.sportsEventsCount}
          />

          {/* Activity Heatmap Grid (Past 365 Days) */}
          <StudentActivityHeatmap
            days={activityData.heatmapDays}
            totalActivities={activityData.totalActiveEvents}
            totalActiveDays={activityData.totalActiveEvents}
            maxStreak={activityData.maxStreak}
          />

          {/* Tabs: Recent Events / Certificates / Following Clubs / Campus Network */}
          <StudentActivityList
            activities={activityData.recentActivities}
            certificates={certificates}
            socialStats={socialStats}
          />
        </div>
      </div>

      {/* Floating Bottom-Right Streak Card with interactive 3D Flip Modal */}
      {streakCardData && (
        <StudentStreakCardPopup cardData={streakCardData} />
      )}
    </div>
  );
}
