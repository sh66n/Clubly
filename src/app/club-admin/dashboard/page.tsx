"use client";
import React, { useState, useRef, useEffect } from "react";
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

/* ═══════════════════════════════════════════
   Mock Data
   ═══════════════════════════════════════════ */
const statsCards = [
  {
    label: "Total Registrations",
    value: "129",
    trend: "up" as const,
    change: "+32",
    since: "since yesterday",
  },
  {
    label: "Total Revenue",
    value: "₹39,345",
    trend: "up" as const,
    change: "+32",
    since: "since yesterday",
  },
  {
    label: "Total Views",
    value: "45",
    trend: "up" as const,
    change: "+32",
    since: "since yesterday",
  },
  {
    label: "Followers",
    value: "19",
    trend: "down" as const,
    change: "-1",
    since: "since yesterday",
  },
];

const registrationChartData = {
  labels: ["03 Aug", "04 Aug", "05 Aug", "06 Aug", "06 Aug", "06 Aug", "06 Aug"],
  values: [7, 8, 12, 11, 14, 13, 15],
};

const eventsStatusData = {
  live: 14,
  upcoming: 8,
  completed: 6,
};

const mockEvents = [
  {
    id: "1",
    name: "AI Innovators 2025",
    image: "/images/default.png",
    teams: 120,
    submissions: 98,
    status: "Live" as const,
    dates: "10-20 Jul 2025",
    mode: "Hybrid",
  },
  {
    id: "2",
    name: "CodeSprint X",
    image: "/images/default.png",
    teams: 85,
    submissions: 76,
    status: "Upcoming" as const,
    dates: "25-30 Aug 2025",
    mode: "Online",
  },
  {
    id: "3",
    name: "HealthHack 4.0",
    image: "/images/default.png",
    teams: 142,
    submissions: 132,
    status: "Live" as const,
    dates: "01-05 Sep 2025",
    mode: "Offline",
  },
  {
    id: "4",
    name: "BuildForIndia",
    image: "/images/default.png",
    teams: 67,
    submissions: 51,
    status: "Completed" as const,
    dates: "12-18 Jun 2025",
    mode: "Hybrid",
  },
  {
    id: "5",
    name: "Gemini AI Hackathon 2025",
    image: "/images/default.png",
    teams: 95,
    submissions: 88,
    status: "Completed" as const,
    dates: "15-22 May 2025",
    mode: "Hybrid",
  },
];

const revenueChartData = {
  labels: ["M", "T", "W", "M", "T", "W", "M"],
  values: [180, 220, 150, 280, 345, 200, 260],
};

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
  value: string;
  trend: "up" | "down";
  change: string;
  since: string;
}) {
  return (
    <div
      className="group rounded-xl p-4 md:p-5 flex flex-col justify-between min-h-[120px] bg-white text-[#222] border border-[#eaeaea] hover:bg-[#091800] hover:text-white hover:border-[#091800] transition-all duration-300 cursor-pointer"
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-[#888] group-hover:text-[#7CB342] transition-colors duration-300">
        {label}
      </div>
      <div className="flex items-end gap-1 mt-2">
        <span className="text-3xl md:text-4xl font-bold leading-none">
          {value}
        </span>
        {trend === "up" ? (
          <TrendingUp size={20} className="text-[#5a8a1c] group-hover:text-white transition-colors duration-300" />
        ) : (
          <TrendingDown size={20} className="text-red-500 group-hover:text-white transition-colors duration-300" />
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full transition-all duration-300 border ${
            trend === "up"
              ? "bg-[#e8f5e9] text-[#5a8a1c] border-transparent group-hover:bg-transparent group-hover:text-[#7CB342] group-hover:border-[#7CB342]"
              : "bg-red-50 text-red-500 border-transparent group-hover:bg-transparent group-hover:text-red-400 group-hover:border-red-400"
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
        <span className="text-xs text-[#999] group-hover:text-white/70 transition-colors duration-300">
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
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
}

/* ═══════════════════════════════════════════
   Main Dashboard Page
   ═══════════════════════════════════════════ */
export default function ClubAdminDashboardPage() {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  /* ── Line chart (Total Registrations) ── */
  const lineChartData = {
    labels: registrationChartData.labels,
    datasets: [
      {
        label: "Registrations",
        data: registrationChartData.values,
        borderColor: "#7CB342",
        backgroundColor: "rgba(124,179,66,0.08)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 5,
        borderWidth: 2,
      },
    ],
  };

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
        ticks: { color: "#999", font: { size: 11 }, stepSize: 5 },
        min: 0,
        max: 15,
      },
    },
  };

  /* ── Doughnut chart (Events Status) ── */
  const doughnutData = {
    labels: ["Live Events", "Upcoming Events", "Completed Events"],
    datasets: [
      {
        data: [
          eventsStatusData.live,
          eventsStatusData.upcoming,
          eventsStatusData.completed,
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
  const barChartData = {
    labels: revenueChartData.labels,
    datasets: [
      {
        label: "Revenue",
        data: revenueChartData.values,
        backgroundColor: revenueChartData.values.map((v) =>
          v === Math.max(...revenueChartData.values)
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
                  <span className="text-xs text-[#999]">Avg:</span>
                  <span className="text-xs font-bold bg-[#7CB342] text-white px-2 py-0.5 rounded-full">
                    13
                  </span>
                  <span className="text-xs font-semibold text-[#7CB342] bg-[#e8f5e9] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
                    <TrendingUp size={10} />
                    +32
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 text-xs font-medium text-[#555] bg-white border border-[#e0e0e0] rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                <Calendar size={13} />
                Time
              </button>
              <span className="text-xs text-[#999] flex items-center gap-1">
                <Calendar size={12} />
                03 Aug, 2026 - 10 Aug, 2026
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
            <button className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
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
                  {eventsStatusData.live}
                </span>
                <span className="text-[10px] text-[#999] font-medium">
                  Live Events
                </span>
              </div>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-col gap-2 mt-4">
            <LegendItem color="#2e3a1f" label="Live Events" />
            <LegendItem color="#7CB342" label="Upcoming Events" />
            <LegendItem color="#a5d610" label="Completed Events" />
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
                  className="bg-transparent text-xs text-[#333] placeholder:text-[#999] outline-none w-32"
                />
              </div>
              <button className="flex items-center gap-1 text-xs font-medium text-[#555] bg-white border border-[#e0e0e0] rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
                <Filter size={13} />
                Filter
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[#eaeaea] text-[#999] text-xs">
                  <th className="py-2 pr-2 font-medium w-8">
                    <input type="checkbox" className="rounded" />
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      ↕ Event Name
                    </span>
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      ↕ Teams
                    </span>
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      ↕ Submissions
                    </span>
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      ↕ Status
                    </span>
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      ↕ Event Dates
                    </span>
                  </th>
                  <th className="py-2 pr-3 font-medium">
                    <span className="inline-flex items-center gap-1">
                      ↕ Mode
                    </span>
                  </th>
                  <th className="py-2 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody>
                {mockEvents.map((event) => (
                  <tr
                    key={event.id}
                    className="border-b border-[#f5f5f5] hover:bg-[#fafafa] transition-colors"
                  >
                    <td className="py-3 pr-2">
                      <input type="checkbox" className="rounded" />
                    </td>
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
                            icon={<Pencil size={14} />}
                            label="Edit"
                          />
                          <DropdownItem
                            icon={<Eye size={14} />}
                            label="View Details"
                          />
                          <DropdownItem
                            icon={<ToggleLeft size={14} />}
                            label="Change Status"
                          />
                          <DropdownItem
                            icon={<Download size={14} />}
                            label="Download Teams List"
                          />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-end gap-3 mt-4 text-xs text-[#999]">
            <span>Show per page</span>
            <select className="bg-white border border-[#e0e0e0] rounded px-2 py-1 text-xs text-[#555]">
              <option>5</option>
              <option>10</option>
              <option>25</option>
            </select>
            <span>1-10 of 1,445</span>
            <div className="flex gap-1">
              <button className="w-6 h-6 flex items-center justify-center rounded border border-[#e0e0e0] hover:bg-gray-50">
                <ChevronLeft size={14} />
              </button>
              <button className="w-6 h-6 flex items-center justify-center rounded border border-[#e0e0e0] hover:bg-gray-50">
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Total Revenue Bar Chart */}
        <div className="bg-white rounded-xl border border-[#eaeaea] p-5 flex flex-col">
          <h3 className="text-base font-bold text-[#222] mb-4">
            Total Revenue
          </h3>
          <div className="flex-1 min-h-[220px] relative">
            <Bar data={barChartData} options={barChartOptions} />
            {/* Highlight label on tallest bar */}
          </div>
          <div className="flex items-center gap-2 mt-4 justify-center">
            <span className="text-xs text-[#999]">Avg:</span>
            <span className="text-xs font-bold bg-[#7CB342] text-white px-2 py-0.5 rounded-full">
              13
            </span>
            <span className="text-xs font-semibold text-[#7CB342] bg-[#e8f5e9] px-2 py-0.5 rounded-full inline-flex items-center gap-0.5">
              <TrendingUp size={10} />
              +32
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
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-[#555] hover:bg-[#f5f5f5] transition-colors">
      {icon}
      {label}
    </button>
  );
}
