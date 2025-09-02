"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Frown } from "lucide-react";
import { Bar } from "react-chartjs-2";

// Register necessary components for Bar chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  upcomingEvents: number[];
}

export default function BarChart({ upcomingEvents }: BarChartProps) {
  //if no events this week
  if (upcomingEvents.every((el) => el === 0)) {
    return (
      <div className="text-[#717171] flex flex-col items-center justify-center grow">
        <Frown className="w-30 h-30" />
        No events this week.
      </div>
    );
  }

  const data = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Events",
        data: [1, 4, 2, 4, 5, 1, 2],
        // data: upcomingEvents,
        backgroundColor: [
          "#000F57",
          "#24306D",
          "#4A5EC4",
          "#000F57",
          "#30429A",
          "#000F57",
          "#001BA2",
        ],
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        suggestedMax: 2,
      },
    },
  };

  return (
    <div className="grow flex items-center justify-center h-40">
      <Bar data={data} options={options} />
    </div>
  );
}
