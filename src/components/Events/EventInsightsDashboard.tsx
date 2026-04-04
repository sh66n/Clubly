"use client";

import BorderedDiv from "@/components/BorderedDiv";
import CloseRegistrationToggle from "@/components/Events/CloseRegistrationToggle";
import DownloadAttendance from "@/components/Events/DownloadAttendance";
import {
  ArrowLeft,
  CalendarCheck,
  ChartNoAxesColumn,
  CircleAlert,
  Crown,
  ExternalLink,
  Filter,
  IndianRupee,
  Search,
  TrendingUp,
  Users,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type InsightsItem = {
  id: string;
  type: "user" | "group";
  name: string;
  email?: string;
  image?: string;
  leaderName?: string;
  memberCount?: number;
  status: "registered" | "attended" | "absent";
  paymentStatus: "created" | "paid" | "failed" | "not-required";
};

type InsightsData = {
  event: {
    _id: string;
    name: string;
    eventType: "team" | "individual";
    date: string;
    maxRegistrations?: number;
    registrationFee?: number;
    isRegistrationOpen?: boolean;
    organizingClub: { _id: string; name: string };
    winner?: { _id: string; name: string };
    winnerGroup?: { _id: string; name: string };
  };
  metrics: {
    isTeamEvent: boolean;
    primaryEntityLabel: string;
    primaryEntityLabelPlural: string;
    totalRegistrations: number;
    attendedCount: number;
    absentCount: number;
    registeredOnlyCount: number;
    attendanceRate: number;
    noShowRate: number;
    totalPeopleRepresented: number;
    attendedPeopleRepresented: number;
    absentPeopleRepresented: number;
    capacityUtilization: number;
    paidCount: number;
    failedCount: number;
    createdCount: number;
    revenue: number;
    avgRevenuePerAttendee: number;
    avgRevenuePerAttendingPerson: number;
  };
  funnel: {
    label: string;
    value: number;
    ratioFromPrevious: number;
    dropFromPrevious: number;
  }[];
  questionInsights: {
    questionId: string;
    question: string;
    type: "text" | "select" | "multiselect";
    totalResponses: number;
    textResponses: number;
    topAnswers: { answer: string; count: number; percentage: number }[];
  }[];
  lists: {
    registered: InsightsItem[];
    attended: InsightsItem[];
    absent: InsightsItem[];
  };
};

interface Props {
  data: InsightsData;
}

const getPaymentPillClasses = (status: InsightsItem["paymentStatus"]) => {
  if (status === "paid") return "bg-green-500/10 text-green-400";
  if (status === "failed") return "bg-red-500/10 text-red-400";
  if (status === "created") return "bg-amber-500/10 text-amber-300";
  return "bg-gray-700/40 text-gray-300";
};

const formatMoney = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);

export default function EventInsightsDashboard({ data }: Props) {
  const [activeList, setActiveList] = useState<
    "registered" | "attended" | "absent"
  >("registered");
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<
    "all" | "paid" | "failed" | "created" | "not-required"
  >("all");

  const listData = data.lists[activeList];

  const filteredList = useMemo(() => {
    return listData.filter((item) => {
      const lower = query.trim().toLowerCase();
      const matchesText =
        lower.length === 0 ||
        item.name.toLowerCase().includes(lower) ||
        item.email?.toLowerCase().includes(lower) ||
        item.leaderName?.toLowerCase().includes(lower);

      const matchesPayment =
        paymentFilter === "all" || item.paymentStatus === paymentFilter;

      return matchesText && matchesPayment;
    });
  }, [listData, paymentFilter, query]);

  const winnerText =
    data.event.eventType === "team"
      ? (data.event.winnerGroup?.name ?? "Not assigned")
      : (data.event.winner?.name ?? "Not assigned");

  const isTeamEvent = data.metrics.isTeamEvent;
  const primaryEntityLabel = data.metrics.primaryEntityLabel;
  const primaryEntityLabelPlural = data.metrics.primaryEntityLabelPlural;
  const drilldownTitle = isTeamEvent
    ? "Team Drilldown"
    : "Participant Drilldown";
  const searchPlaceholder = isTeamEvent
    ? "Search by team or leader"
    : "Search by name/email";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link
            href={`/events/${data.event._id}`}
            className="mb-2 inline-flex items-center gap-2 text-sm text-[#8D8D8D] hover:text-white"
          >
            <ArrowLeft size={14} />
            Back to Event
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold">
            {data.event.name} Insights
          </h1>
          <p className="text-sm text-[#8D8D8D] mt-1">
            {data.event.organizingClub?.name} • Admin analytics workspace
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/events/${data.event._id}/attendance`}
            className="px-3 py-2 rounded-lg border border-[#515151] text-sm hover:border-gray-300 inline-flex items-center gap-2"
          >
            <CalendarCheck size={16} />
            Attendance
          </Link>
          <Link
            href={`/events/${data.event._id}/assign-winner`}
            className="px-3 py-2 rounded-lg border border-[#515151] text-sm hover:border-gray-300 inline-flex items-center gap-2"
          >
            <Crown size={16} />
            Assign Winner
          </Link>
          <Link
            href={`/events/${data.event._id}/edit`}
            className="px-3 py-2 rounded-lg border border-[#515151] text-sm hover:border-gray-300 inline-flex items-center gap-2"
          >
            <ExternalLink size={16} />
            Edit Event
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <BorderedDiv>
          <div className="text-sm text-[#8D8D8D]">
            {isTeamEvent ? "Team Registrations" : "Participant Registrations"}
          </div>
          <div className="mt-2 text-3xl font-bold text-[#5E77F5]">
            {data.metrics.totalRegistrations}
          </div>
          <div className="text-xs text-[#8D8D8D] mt-1">
            {isTeamEvent
              ? `${data.metrics.totalPeopleRepresented} total participants represented`
              : "Total entries captured"}
          </div>
        </BorderedDiv>

        <BorderedDiv>
          <div className="text-sm text-[#8D8D8D]">Attendance Rate</div>
          <div className="mt-2 text-3xl font-bold text-[#5E77F5]">
            {data.metrics.attendanceRate}%
          </div>
          <div className="text-xs text-[#8D8D8D] mt-1">
            {data.metrics.attendedCount} {primaryEntityLabelPlural} attended •{" "}
            {data.metrics.absentCount} absent
            {isTeamEvent && (
              <span>
                {` • ${data.metrics.attendedPeopleRepresented} participants attended`}
              </span>
            )}
          </div>
        </BorderedDiv>

        <BorderedDiv>
          <div className="text-sm text-[#8D8D8D]">Revenue Collected</div>
          <div className="mt-2 text-3xl font-bold text-[#5E77F5]">
            {formatMoney(data.metrics.revenue)}
          </div>
          <div className="text-xs text-[#8D8D8D] mt-1">
            {data.metrics.paidCount} {primaryEntityLabelPlural} paid • Avg per
            attended {primaryEntityLabel}:{" "}
            {formatMoney(data.metrics.avgRevenuePerAttendee)}
            {isTeamEvent && (
              <span>
                {` • Avg per attendee: ${formatMoney(data.metrics.avgRevenuePerAttendingPerson)}`}
              </span>
            )}
          </div>
        </BorderedDiv>

        <BorderedDiv>
          <div className="text-sm text-[#8D8D8D]">Capacity Utilization</div>
          <div className="mt-2 text-3xl font-bold text-[#5E77F5]">
            {data.metrics.capacityUtilization}%
          </div>
          <div className="text-xs text-[#8D8D8D] mt-1">
            Winner: {winnerText}
          </div>
        </BorderedDiv>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <BorderedDiv className="xl:col-span-2">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <ChartNoAxesColumn size={18} />
            Conversion Funnel
          </div>

          <div className="mt-4 space-y-3">
            {data.funnel.map((stage) => (
              <div
                key={stage.label}
                className="rounded-lg border border-[#323232] p-3"
              >
                <div className="flex items-center justify-between text-sm mb-2">
                  <span>{stage.label}</span>
                  <span className="text-[#8D8D8D]">{stage.value}</span>
                </div>
                <div className="h-2 rounded-full bg-[#1B1B1B] overflow-hidden">
                  <div
                    className="h-full bg-[#5E77F5]"
                    style={{
                      width: `${Math.max(Math.min(stage.ratioFromPrevious, 100), 6)}%`,
                    }}
                  />
                </div>
                <div className="mt-2 text-xs text-[#8D8D8D]">
                  {stage.ratioFromPrevious}% retained
                  {stage.dropFromPrevious > 0
                    ? ` • ${stage.dropFromPrevious} dropped`
                    : ""}
                </div>
              </div>
            ))}
          </div>
        </BorderedDiv>

        <BorderedDiv>
          <div className="text-lg font-semibold">Admin Actions</div>
          <div className="mt-3 space-y-2 text-sm">
            <DownloadAttendance
              eventId={data.event._id}
              eventName={data.event.name}
            />
            <CloseRegistrationToggle
              eventId={data.event._id}
              initialStatus={data.event.isRegistrationOpen ?? true}
            />
          </div>
          <div className="mt-4 space-y-2 text-xs text-[#8D8D8D]">
            <p className="flex items-center gap-2">
              <Users size={14} />
              Registered only: {data.metrics.registeredOnlyCount}{" "}
              {primaryEntityLabelPlural}
            </p>
            <p className="flex items-center gap-2">
              <UserX size={14} />
              No-show rate: {data.metrics.noShowRate}%
              {isTeamEvent
                ? ` (${data.metrics.absentPeopleRepresented} participants)`
                : ""}
            </p>
            <p className="flex items-center gap-2">
              <IndianRupee size={14} />
              Pending payments: {data.metrics.createdCount}
            </p>
            <p className="flex items-center gap-2">
              <CircleAlert size={14} />
              Failed payments: {data.metrics.failedCount}
            </p>
          </div>
        </BorderedDiv>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <BorderedDiv className="xl:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-lg font-semibold">{drilldownTitle}</div>

            <div className="flex items-center gap-2 rounded-lg border border-[#444] px-3 py-2 text-sm">
              <Search size={14} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="bg-transparent outline-none"
                placeholder={searchPlaceholder}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(["registered", "attended", "absent"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setActiveList(status)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  activeList === status
                    ? "bg-[#5E77F5] text-white"
                    : "bg-[#202020] text-[#9A9A9A] hover:text-white"
                }`}
              >
                {status[0].toUpperCase() + status.slice(1)}{" "}
                {primaryEntityLabelPlural} ({data.lists[status].length})
              </button>
            ))}
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-[#8D8D8D]">
            <Filter size={13} />
            Payment filter:
            <select
              value={paymentFilter}
              onChange={(e) =>
                setPaymentFilter(
                  e.target.value as
                    | "all"
                    | "paid"
                    | "failed"
                    | "created"
                    | "not-required",
                )
              }
              className="bg-[#1C1C1C] rounded border border-[#444] px-2 py-1"
            >
              <option value="all">All</option>
              <option value="paid">Paid</option>
              <option value="created">Created</option>
              <option value="failed">Failed</option>
              <option value="not-required">No Payment Required</option>
            </select>
          </div>

          <div className="mt-4 max-h-[26rem] overflow-y-auto space-y-2 pr-1">
            {filteredList.length === 0 && (
              <div className="text-sm text-[#8D8D8D] p-4 border border-dashed border-[#444] rounded-lg">
                No entries matched the filters.
              </div>
            )}

            {filteredList.map((item) => (
              <div
                key={`${item.type}-${item.id}`}
                className="rounded-lg border border-[#2D2D2D] p-3 flex items-center justify-between gap-3"
              >
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-[#8D8D8D]">
                    {item.type === "group"
                      ? `Group • ${item.memberCount ?? 0} members${item.leaderName ? ` • Lead ${item.leaderName}` : ""}`
                      : item.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${getPaymentPillClasses(item.paymentStatus)}`}
                  >
                    {item.paymentStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </BorderedDiv>

        <BorderedDiv>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <TrendingUp size={18} />
            Registration Questions
          </div>
          <div className="mt-3 space-y-3 max-h-[26rem] overflow-y-auto pr-1">
            {data.questionInsights.length === 0 && (
              <div className="text-sm text-[#8D8D8D] border border-dashed border-[#444] rounded-lg p-4">
                This event has no custom registration questions.
              </div>
            )}

            {data.questionInsights.map((question) => (
              <div
                key={question.questionId}
                className="rounded-lg border border-[#303030] p-3"
              >
                <div className="text-sm font-medium">{question.question}</div>
                <div className="text-xs text-[#8D8D8D] mt-1">
                  {question.totalResponses} responses
                </div>

                {question.type === "text" ? (
                  <p className="text-xs text-[#8D8D8D] mt-2">
                    Text question with {question.textResponses} submitted
                    answers.
                  </p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {question.topAnswers.map((answer) => (
                      <div key={`${question.questionId}-${answer.answer}`}>
                        <div className="flex justify-between text-xs">
                          <span className="truncate pr-2">{answer.answer}</span>
                          <span className="text-[#8D8D8D]">
                            {answer.count} • {answer.percentage}%
                          </span>
                        </div>
                        <div className="h-1.5 rounded-full bg-[#1D1D1D] mt-1">
                          <div
                            className="h-full bg-[#5E77F5] rounded-full"
                            style={{
                              width: `${Math.max(Math.min(answer.percentage, 100), 4)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </BorderedDiv>
      </div>
    </div>
  );
}
