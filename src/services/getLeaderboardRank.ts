export async function getLeaderboardRank(clubId: string, userId: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/clubs/${clubId}/users/${userId}/rank`,
      {
        method: "GET",
        cache: "no-store", // ensures fresh data
      }
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch rank: ${res.statusText}`);
    }

    return res.json(); // { _id, rank, points, totalUsers }
  } catch (error) {
    console.error("Error fetching club rank:", error);
    return null;
  }
}
