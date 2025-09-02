import { Event } from "@/models/event.model";
import { Types } from "mongoose";

function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun, 1=Mon...
  const diffToMonday = (day === 0 ? -6 : 1) - day;

  const startOfWeek = new Date(now);
  startOfWeek.setHours(0, 0, 0, 0);
  startOfWeek.setDate(now.getDate() + diffToMonday);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);

  return { startOfWeek, endOfWeek };
}

export async function getWeeklyEventCounts() {
  const { startOfWeek, endOfWeek } = getWeekRange();

  // Fetch events for this week
  const events = await Event.find({
    date: { $gte: startOfWeek, $lte: endOfWeek },
  }).select("date");

  // Initialize [Mon..Sun]
  const counts = [0, 0, 0, 0, 0, 0, 0];

  events.forEach((event) => {
    const dayIndex = (event.date.getDay() + 6) % 7;
    // convert: Mon=0, Tue=1, ..., Sun=6
    counts[dayIndex]++;
  });

  return counts; // e.g. [0, 1, 0, 3, 2, 5, 0]
}
