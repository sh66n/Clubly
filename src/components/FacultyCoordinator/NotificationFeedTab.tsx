"use client";
import React, { useState, useEffect } from "react";
import { Bell, Calendar, CreditCard, MessageSquare, Loader2, RefreshCw } from "lucide-react";
import { useAcademicYear } from "@/context/AcademicYearContext";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: "registration" | "payment" | "feedback";
}

export default function NotificationFeedTab() {
  const { academicYear } = useAcademicYear();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchFeed = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/club-admin/notifications?academicYear=${academicYear}`);
      if (!res.ok) throw new Error("Failed to load notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, [academicYear]);

  const getIcon = (type: string) => {
    switch (type) {
      case "registration":
        return <Calendar size={16} className="text-blue-500" />;
      case "payment":
        return <CreditCard size={16} className="text-emerald-500" />;
      case "feedback":
        return <MessageSquare size={16} className="text-amber-500" />;
      default:
        return <Bell size={16} className="text-[#7CB342]" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Bell size={18} className="text-[#7CB342]" />
            Official Club Activity Stream
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time feed of registrations, fee receipts, and participant feedback reviews.
          </p>
        </div>

        <button
          onClick={fetchFeed}
          className="px-3.5 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RefreshCw size={13} />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center">
          <Loader2 size={24} className="animate-spin text-[#7CB342]" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="py-16 text-center text-slate-400 space-y-2">
          <Bell size={32} className="mx-auto text-slate-300" />
          <p className="text-xs font-semibold text-slate-600">No activity recorded for this period</p>
          <p className="text-[11px] text-slate-400">
            Student registrations and feedback reviews will appear here in chronological order.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold text-slate-900">{item.title}</p>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(item.time).toLocaleString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-normal break-words">
                  {item.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
