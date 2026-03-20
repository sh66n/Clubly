import { ClubMember } from "@/models/clubmember.model";

export async function getClubsJoined(userId: string) {
  const memberships = await ClubMember.find({ userId }).populate(
    "clubId",
    "name department logo",
  );

  return memberships.map((m) => m.clubId);
}
