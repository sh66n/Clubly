"use client";

import React, { useMemo } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

interface PerformanceChartProps {
  data: {
    month: string;
    registrations: number;
    events: number;
  }[];
}

export default function PerformanceChart({ data }: PerformanceChartProps) {
  const chartData = useMemo(() => {
    const labels = data.map((d) => d.month);
    const registrations = data.map((d) => d.registrations);

    return {
      labels,
      datasets: [
        {
          label: "Registrations",
          data: registrations,
          fill: true,
          borderColor: "#9e6283",
          borderWidth: 2,
          tension: 0.45,
          pointBackgroundColor: "#e9b8d2",
          pointBorderColor: "#321d2a",
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return "rgba(158, 98, 131, 0.05)";
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, "rgba(158, 98, 131, 0.22)");
            gradient.addColorStop(0.7, "rgba(80, 48, 66, 0.05)");
            gradient.addColorStop(1, "rgba(22, 22, 26, 0)");
            return gradient;
          },
        },
      ],
    };
  }, [data]);

  const options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: "#1e1d25",
        titleColor: "#f0eff7",
        bodyColor: "#c797b0",
        borderColor: "#333140",
        borderWidth: 1,
        padding: 10,
        displayColors: false,
        callbacks: {
          title: (items: any) => `${items[0]?.label}`,
          label: (context: any) => `${context.parsed.y} Student Registrations`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6b6a78",
          font: {
            size: 11,
          },
        },
      },
      y: {
        grid: {
          color: "rgba(255, 255, 255, 0.03)",
        },
        border: {
          display: false,
        },
        ticks: {
          color: "#6b6a78",
          font: {
            size: 11,
          },
          precision: 0,
        },
      },
    },
  };

  return (
    <div className="h-full w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
