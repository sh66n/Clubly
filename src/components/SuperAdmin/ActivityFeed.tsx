"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Ticket, ShieldCheck, Calendar } from "lucide-react";

interface ActivityFeedItem {
  id: string;
  type: "audit" | "registration" | "event";
  title: string;
  description: string;
  timestamp: string;
  createdAt: string;
  badge?: string;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
  club?: {
    name: string;
    logo?: string;
  };
}

interface ActivityFeedProps {
  initialActivities: ActivityFeedItem[];
}

export default function ActivityFeed({ initialActivities }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityFeedItem[]>(initialActivities);

  const refreshFeed = async () => {
    try {
      const res = await fetch("/api/super-admin/activity-feed");
      const data = await res.json();
      if (data.activities) {
        setActivities(data.activities);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      refreshFeed();
    }, 20000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-2.5">
      {activities.length === 0 ? (
        <div className="py-10 text-center text-xs text-[#6e6d7d]">
          No campus activity logged yet.
        </div>
      ) : (
        activities.slice(0, 5).map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between p-2 rounded-2xl hover:bg-[#1e1d24] transition-colors"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              {act.user?.image ? (
                <Image
                  src={act.user.image}
                  alt={act.user.name || "Student"}
                  width={34}
                  height={34}
                  className="h-[34px] w-[34px] rounded-full object-cover border border-[#2e2d39] shrink-0"
                />
              ) : (
                <div className="h-[34px] w-[34px] rounded-full bg-[#201f27] border border-[#2f2e3a] flex items-center justify-center text-xs text-[#9d9cae] shrink-0">
                  {act.type === "audit" ? (
                    <ShieldCheck className="h-4 w-4 text-[#c78ba8]" />
                  ) : act.type === "event" ? (
                    <Calendar className="h-4 w-4 text-[#a09fae]" />
                  ) : (
                    <Ticket className="h-4 w-4 text-[#34d399]" />
                  )}
                </div>
              )}
              <div className="truncate">
                <p className="text-[12.5px] font-semibold text-[#f0eff8] truncate">
                  {act.title}
                </p>
                <p className="text-[11px] text-[#717080] truncate">
                  {act.description}
                </p>
              </div>
            </div>

            <div className="text-right shrink-0 pl-2">
              <span className="text-[10px] text-[#8e8d9e] block font-medium">
                {act.timestamp}
              </span>
              <span
                className={`text-[10px] font-medium ${
                  act.badge === "Promoted"
                    ? "text-[#f472b6]"
                    : act.badge === "Demoted"
                    ? "text-[#fb7185]"
                    : "text-[#34d399]"
                }`}
              >
                {act.badge || "Activity"}
              </span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
