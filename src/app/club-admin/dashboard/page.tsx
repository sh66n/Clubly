"use client";
import React, { useState, useRef, useEffect } from "react";
import { useAcademicYear } from "@/context/AcademicYearContext";
import ClublyLoader from "@/components/ClubAdmin/ClublyLoader";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Eye,
  ToggleLeft,
  Download,
  Users,
  Loader2,
} from "lucide-react";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

interface DashboardData {
  stats: {
    totalRegistrations: number;
    registrationsChange: number;
    totalRevenue: number;
    revenueChange: number;
    followers: number;
  };
  registrationChart: {
    labels: string[];
    values: number[];
  };
  revenueChart: {
    labels: string[];
    values: number[];
  };
  eventsStatus: {
    live: number;
    draft: number;
    completed: number;
  };
  recentEvents: Array<{
    id: string;
    name: string;
    image: string;
    teams: number;
    submissions: number;
    status: "Live" | "Upcoming" | "Completed";
    dates: string;
    mode: string;
  }>;
  availableAcademicYears?: string[];
}

/* ═══════════════════════════════════════════
   Sub-components
   ═══════════════════════════════════════════ */

function StatCard({
  label,
  value,
  trend,
  change,
  since,
}: {
  label: string;
  value: string | number;
  trend: "up" | "down";
  change: string;
  since: string;
}) {
  return (
    <div className="rounded-xl p-4 md:p-5 flex flex-col justify-between min-h-[120px] bg-[#091800] text-white border border-[#091800] transition-all duration-300">
      <div className="text-xs font-bold uppercase tracking-wide text-[#9ccc65] transition-colors duration-300">
        {label}
      </div>
      <div className="flex items-end gap-1 mt-2">
        <span className="text-3xl md:text-4xl font-bold leading-none">
          {value}
        </span>
        {trend === "up" ? (
          <TrendingUp size={20} className="text-white" />
        ) : (
          <TrendingDown size={20} className="text-white" />
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300 border ${
            trend === "up"
              ? "bg-transparent text-[#9ccc65] border-[#9ccc65]"
              : "bg-transparent text-red-400 border-red-400"
          }`}
        >
          <span className="inline-flex items-center gap-0.5">
            {trend === "up" ? (
              <TrendingUp size={12} />
            ) : (
              <TrendingDown size={12} />
            )}
            {change}
          </span>
        </span>
        <span className="text-xs text-white/70 transition-colors duration-300">
          {since}
        </span>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: "Live" | "Upcoming" | "Completed" }) {
  const styles = {
    Live: "bg-[#fff3e0] text-[#e65100]",
    Upcoming: "bg-[#e8f5e9] text-[#2e7d32]",
    Completed: "bg-[#e3f2fd] text-[#1565c0]",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
}

/* ═══════════════════════════════════════════
   Main Dashboard Page
   ═══════════════════════════════════════════ */
export default function ClubAdminDashboardPage() {
  const { academicYear, availableYears, setAvailableYears } = useAcademicYear();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchDashboardData = async () => {
    if (!academicYear) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/club-admin/dashboard?academicYear=${academicYear}`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to load dashboard data");
      }
      const json = await res.json();
      setData(json);
      if (json.availableAcademicYears) {
        setAvailableYears(json.availableAcademicYears);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [academicYear]);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full">
        <ClublyLoader />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-xl border border-red-200 p-6 text-center text-red-600">
        <p className="font-semibold">{error || "Failed to load data"}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 px-4 py-2 bg-[#7CB342] text-white rounded-lg text-sm font-medium hover:bg-[#689F38] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { stats, registrationChart, revenueChart, eventsStatus, recentEvents } = data;

  const statsCards = [
    {
      label: "Total Registrations",
      value: stats.totalRegistrations.toLocaleString(),
      trend: "up" as const,
      change: `+${stats.registrationsChange}`,
      since: "since yesterday",
    },
    {
      label: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      trend: "up" as const,
      change: `+₹${stats.revenueChange}`,
      since: "since yesterday",
    },
    {
      label: "Total Events",
      value: (eventsStatus.live + eventsStatus.draft + eventsStatus.completed).toLocaleString(),
      trend: "up" as const,
      change: `${eventsStatus.draft} Drafts`,
      since: "currently managed",
    },
    {
      label: "Followers",
      value: stats.followers.toLocaleString(),
      trend: "up" as const,
      change: "Active",
      since: "community members",
    },
  ];

  /* ── Line chart (Total Registrations) ── */
  const lineChartData = {
    labels: registrationChart.labels.length > 0 ? registrationChart.labels : ["No Data"],
    datasets: [
      {
        label: "Registrations",
        data: registrationChart.values.length > 0 ? registrationChart.values : [0],
        borderColor: "#7CB342",
        backgroundColor: "rgba(124,179,66,0.08)",
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
        borderWidth: 2,
      },
    ],
  };

  const maxRegValue = Math.max(...(registrationChart.values.length ? registrationChart.values : [5]), 5);
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#999", font: { size: 11 } },
      },
      y: {
        grid: { color: "#eee", borderDash: [4, 4] as [number, number] },
        ticks: { color: "#999", font: { size: 11 }, precision: 0 },
        min: 0,
        suggestedMax: Math.ceil(maxRegValue * 1.2),
      },
    },
  };

  /* ── Doughnut chart (Events Status) ── */
  const doughnutData = {
    labels: ["Live Events", "Draft Events", "Completed Events"],
    datasets: [
      {
        data: [
          eventsStatus.live,
          eventsStatus.draft,
          eventsStatus.completed,
        ],
        backgroundColor: ["#2e3a1f", "#7CB342", "#a5d610"],
        borderWidth: 0,
        cutout: "65%",
      },
    ],
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  /* ── Bar chart (Total Revenue) ── */
  const maxRevenueVal = Math.max(...(revenueChart.values.length ? revenueChart.values : [1]), 1);
  const barChartData = {
    labels: revenueChart.labels.length > 0 ? revenueChart.labels : ["Mon"],
    datasets: [
      {
        label: "Revenue",
        data: revenueChart.values.length > 0 ? revenueChart.values : [0],
        backgroundColor: revenueChart.values.map((v) =>
          v === maxRevenueVal && v > 0
            ? "#7CB342"
            : "#c5e1a5",
        ),
        borderRadius: 6,
        barThickness: 28,
      },
    ],
  };

  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#999", font: { size: 11 } },
      },
      y: {
        display: false,
      },
    },
  };

  // Filter & Paginate Events
  const filteredEvents = recentEvents.filter((ev) =>
    ev.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const totalFiltered = filteredEvents.length;
  const totalPages = Math.ceil(totalFiltered / pageSize) || 1;
  const startIdx = (currentPage - 1) * pageSize;
  const paginatedEvents = filteredEvents.slice(startIdx, startIdx + pageSize);

  const avgReg = registrationChart.values.length
    ? Math.round(registrationChart.values.reduce((a, b) => a + b, 0) / registrationChart.values.length)
    : 0;

  return (
    <div className="space-y-5">
      {/* ──────── Stat Cards ──────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ──────── Charts Row: Line + Doughnut ──────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Total Registrations Line Chart */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#eaeaea] p-5">
          {/* Chart header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#f0f0f0] flex items-center justify-center">
                <Users size={18} className="text-[#555]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#222]">
                  Total Registrations
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-[#999]">Avg / day:</span>
                  <span className="text-xs font-bold bg-[#7CB342] text-white px-2 py-0.5 rounded-full">
                    {avgReg}
                  </span>
                  <span className="text-xs font-semibold text-[#7CB342] bg-[#e8f5e9] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                    <TrendingUp size={10} />
                    +{stats.registrationsChange}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-1.5 text-xs font-medium text-[#555] bg-white border border-[#e0e0e0] rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={13} />
                Refresh
              </button>
              <span className="text-xs text-[#999] flex items-center gap-1">
                <Calendar size={12} />
                Last 7 Days
              </span>
            </div>
          </div>
          {/* Chart */}
          <div className="h-56 md:h-64">
            <Line data={lineChartData} options={lineChartOptions} />
          </div>
        </div>

        {/* Events Status Overview */}
        <div className="bg-white rounded-xl border border-[#eaeaea] p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#222]">
              Events Status Overview
            </h3>
            <button
              onClick={fetchDashboardData}
              className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
            >
              <RefreshCw size={15} className="text-[#999]" />
            </button>
          </div>
          {/* Doughnut */}
          <div className="flex-1 flex items-center justify-center min-h-[180px] relative">
            <div className="w-48 h-48 relative">
              <Doughnut data={doughnutData} options={doughnutOptions} />
              {/* Center label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-[#222]">
                  {eventsStatus.live}
                </span>
                <span className="text-[10px] text-[#999] font-medium">
                  Live Events
                </span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-2 mt-4">
            <LegendItem color="#2e3a1f" label={`Live Events (${eventsStatus.live})`} />
            <LegendItem color="#7CB342" label={`Draft Events (${eventsStatus.draft})`} />
            <LegendItem color="#a5d610" label={`Completed Events (${eventsStatus.completed})`} />
          </div>
        </div>
      </div>

      {/* ──────── Bottom Row: Table + Revenue ──────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Recent Events Activity Table */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-[#eaeaea] p-5">
          {/* Table header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <h3 className="text-base font-bold text-[#222]">
              Recent Events Activity
            </h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-lg px-3 py-1.5 gap-2">
                <Search size={14} className="text-[#999]" />
                <input
                  type="text"
                  placeholder="Search here…"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent text-xs text-[#333] placeholder:text-[#999] outline-none w-32"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#eaeaea] text-[#999] text-xs">
                  <th className="py-2 pr-3 font-medium">
                    Event Name
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    Teams / Regs
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    Attended
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    Status
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    Event Date
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    Mode
                  </th>
                  <th className="py-2 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-6 text-center text-xs text-[#999]">
                      No events found.
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((event) => (
                    <tr
                      key={event.id}
                      className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors"
                    >
                      <td className="py-3 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#f0f0f0] flex-shrink-0 overflow-hidden">
                            <img
                              src={event.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="font-medium text-[#222] whitespace-nowrap">
                            {event.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-[#555]">{event.teams}</td>
                      <td className="py-3 pr-3 text-[#555]">
                        {event.submissions}
                      </td>
                      <td className="py-3 pr-3">
                        <StatusBadge status={event.status} />
                      </td>
                      <td className="py-3 pr-3 text-[#555] whitespace-nowrap text-xs">
                        {event.dates}
                      </td>
                      <td className="py-3 pr-3 text-[#555] text-xs">
                        {event.mode}
                      </td>
                      <td className="py-3 relative" ref={openMenuId === event.id ? menuRef : null}>
                        <button
                          onClick={() =>
                            setOpenMenuId(
                              openMenuId === event.id ? null : event.id,
                            )
                          }
                          className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                        >
                          <MoreVertical size={16} className="text-[#999]" />
                        </button>
                        {openMenuId === event.id && (
                          <div className="absolute right-0 top-10 z-20 bg-white border border-[#e0e0e0] rounded-xl shadow-lg py-1.5 min-w-[180px]">
                            <DropdownItem
                              icon={<Eye size={14} />}
                              label="View Event Details"
                              onClick={() => {
                                window.location.href = `/club-admin/events/${event.id}`;
                              }}
                            />
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalFiltered > 0 && (
            <div className="flex items-center justify-end gap-3 mt-4 text-xs text-[#999]">
              <span>Show per page</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-[#e0e0e0] rounded px-2 py-1 text-xs text-[#555]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
              </select>
              <span>
                {startIdx + 1}-{Math.min(startIdx + pageSize, totalFiltered)} of {totalFiltered}
              </span>
              <div className="flex gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="w-6 h-6 flex items-center justify-center rounded border border-[#e0e0e0] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="w-6 h-6 flex items-center justify-center rounded border border-[#e0e0e0] hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Total Revenue Bar Chart */}
        <div className="bg-white rounded-xl border border-[#eaeaea] p-5 flex flex-col">
          <h3 className="text-base font-bold text-[#222] mb-4">
            Total Revenue (7 days)
          </h3>
          <div className="flex-1 min-h-[220px] relative">
            <Bar data={barChartData} options={barChartOptions} />
          </div>
          <div className="flex items-center gap-2 mt-4 justify-center">
            <span className="text-xs text-[#999]">Total Revenue:</span>
            <span className="text-xs font-bold bg-[#7CB342] text-white px-2 py-0.5 rounded-full">
              ₹{stats.totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helpers ── */
function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#555] flex-1">{label}</span>
      <div
        className="w-3 h-3 rounded-sm"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#555] hover:bg-[#f5f5f5] transition-colors"
    >
      {icon}
      {label}
    </button>
  );
}

