"use client";

import React from "react";
import GroupCard from "./GroupCard";
import Link from "next/link";
import BorderedDiv from "../BorderedDiv";

interface GroupGridProps {
  groups: any[];
  actionForGroup?: (group: any) => React.ReactNode;
}

export default function GroupGrid({ groups, actionForGroup }: GroupGridProps) {
  if (!groups?.length) {
    return <p className="text-gray-400 text-sm">No groups available.</p>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {groups.map((group) => (
        <Link href={`groups/${group._id}`} key={group._id}>
          <BorderedDiv>
            <GroupCard group={group} />
          </BorderedDiv>
        </Link>
      ))}
    </div>
  );
}
