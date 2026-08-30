import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Hackathon } from "@/models/hackathon.model";
import { HackathonTeam } from "@/models/hackathonTeam.model";
import { HackathonRegistration } from "@/models/hackathonRegistration.model";
import { Submission } from "@/models/submission.model";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.adminClub) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDb();
    const clubId = session.user.adminClub;

    const hackathons = await Hackathon.find({ organizingClub: clubId }).sort({ createdAt: -1 }).lean();

    let live = 0, draft = 0, completed = 0;
    let totalRegistrations = 0, totalTeams = 0, totalSubmissions = 0, totalRevenue = 0;

    const enrichedHackathons = await Promise.all(
      hackathons.map(async (h: any) => {
        if (h.status === "live") live++;
        if (h.status === "draft") draft++;
        if (h.status === "completed") completed++;

        const registrations = await HackathonRegistration.countDocuments({ hackathon: h._id });
        const teams = await HackathonTeam.countDocuments({ hackathon: h._id });
        const submissions = await Submission.countDocuments({ hackathon: h._id });

        totalRegistrations += registrations;
        totalTeams += teams;
        totalSubmissions += submissions;

        return {
          ...h,
          registrationsCount: registrations,
          teamsCount: teams,
          submissionsCount: submissions,
          revenue: 0,
        };
      })
    );

    return NextResponse.json({
      hackathons: enrichedHackathons,
      metrics: {
        totalHackathons: hackathons.length,
        live,
        draft,
        completed,
        totalRegistrations,
        totalTeams,
        totalSubmissions,
        totalRevenue,
      },
    });
  } catch (error: any) {
    console.error("Fetch hackathons error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
