import React from "react";
import Table from "./Table";
import Podium from "./Podium";

export default function Leaderboard({ topUsers }) {
  const enoughData = topUsers.length >= 3;

  return enoughData ? (
    <div className="w-full h-full grow">
      <Podium topThree={topUsers.slice(0, 3)} />
      <Table topUsers={topUsers} />
    </div>
  ) : (
    <div>Not enough data</div>
  );
}
