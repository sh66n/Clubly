"use client";
import Link from "next/link";
import React, { ReactNode } from "react";

interface UserCardProps {
  user: { _id: string; name: string; email: string; image: string };
  action?: ReactNode; // flexible slot
}

export default function UserCard({ user, action }: UserCardProps) {
  return (
    <Link href={`/profiles/${user._id}`}>
      <div className="bg-gray-900 flex gap-2 items-center p-2 rounded-lg">
        <img
          src={user.image}
          className="h-8 w-8 rounded-full"
          alt={user.name}
        />
        <span className="text-white">{user.name}</span>
        <div className="ml-auto">{action}</div>
      </div>
    </Link>
  );
}
