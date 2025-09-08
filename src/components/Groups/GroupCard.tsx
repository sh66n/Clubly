"use client";

import React from "react";
import BorderedDiv from "../BorderedDiv";
import { Globe, Lock } from "lucide-react";
import UserCard from "../Events/UserCard";
import Link from "next/link";

export default function GroupCard({ group }) {
  return (
    <>
      <div className="flex justify-between mb-2">
        <span className="text-xl">{group.name}</span>
        <span>{group.isPublic ? <Globe /> : <Lock />}</span>
      </div>
      <div className="flex flex-col gap-2">
        {group.members?.map((member, idx) => {
          if (member._id === group.leader._id) {
            return (
              <UserCard
                user={member}
                key={member._id}
                action={<span className="text-[#717171]">Leader</span>}
              />
            );
          }
          return <UserCard user={member} key={member._id} />;
        })}
      </div>
    </>
  );
}
