"use client";
import React from "react";
import AttendanceToggle from "./AttendanceToggle";

interface AttendanceUserCardProps {
  user: { _id: string; name: string; email: string; image: string };
  isPresent: boolean;
  onToggle: (userId: string, makePresent: boolean) => void;
}

export default function AttendanceUserCard({
  user,
  isPresent,
  onToggle,
}: AttendanceUserCardProps) {
  return (
    <div className="bg-gray-900 flex gap-2 items-center p-2 rounded-lg">
      <img src={user.image} className="h-8 w-8 rounded-full" alt={user.name} />
      <span className="text-white">{user.name}</span>
      <div className="ml-auto">
        <AttendanceToggle
          isPresent={isPresent}
          onChange={(makePresent) => onToggle(user._id, makePresent)}
        />
      </div>
    </div>
  );
}
