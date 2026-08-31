import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CLUB_COLORS = [
  "bg-red-500",
  "bg-blue-500",
  "bg-green-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-yellow-500",
  "bg-orange-500",
  "bg-cyan-500",
];

export function getColorFromString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return CLUB_COLORS[Math.abs(hash) % CLUB_COLORS.length];
}

export function getProfileStatus(user: any) {
  let score = 0;
  const missing: string[] = [];

  if (user?.name && String(user.name).trim() !== "") {
    score += 25;
  } else {
    missing.push("Name");
  }

  if (user?.email && String(user.email).trim() !== "") {
    score += 25;
  } else {
    missing.push("Email Address");
  }

  if (user?.image && String(user.image).trim() !== "") {
    score += 10;
  } else {
    missing.push("Profile Picture");
  }

  if (
    user?.department &&
    String(user.department).trim() !== "" &&
    user.department !== "Not Assigned"
  ) {
    score += 25;
  } else {
    missing.push("Department");
  }

  if (
    user?.year !== undefined &&
    user?.year !== null &&
    user.year !== "Not Assigned" &&
    String(user.year).trim() !== ""
  ) {
    score += 15;
  } else {
    missing.push("Year");
  }

  return {
    percentage: score,
    isComplete: score === 100,
    missingFields: missing,
  };
}
