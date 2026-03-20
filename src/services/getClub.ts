import { connectToDb } from "@/lib/connectToDb";
import { Club, Event, ClubMember } from "@/models";

export const getClub = async (clubId: string) => {
  // Ensure database is connected
  await connectToDb();

  // Find club by ID
  const club = await Club.findById(clubId);

  if (!club) {
    return null;
  }

  // Fetch members from ClubMember collection
  const coreTeamDocs = await ClubMember.find({
    clubId,
    role: "core",
  }).populate("userId");

  const volunteerDocs = await ClubMember.find({
    clubId,
    role: "volunteer",
  }).populate("userId");

  // Fetch events for this club
  const events = await Event.find({ organizingClub: clubId });

  // Return combined data
  return {
    ...club.toObject(),
    coreTeamMembers: coreTeamDocs.map((m) => m.userId),
    volunteerMembers: volunteerDocs.map((m) => m.userId),
    totalMembers: coreTeamDocs.length + volunteerDocs.length,
    events,
  };
};
