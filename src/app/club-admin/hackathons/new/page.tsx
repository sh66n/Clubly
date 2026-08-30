import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NewHackathonForm from "@/components/Hackathons/NewHackathonForm";

export default async function ClubAdminNewHackathonPage() {
  const session = await auth();

  if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
    redirect("/login");
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Create Hackathon</h1>
        <p className="text-sm text-slate-500 mt-1">
          Set up a new multi-round hackathon, team parameters, stages, and PPT submission rules.
        </p>
      </div>

      <NewHackathonForm clubId={session.user.adminClub} />
    </div>
  );
}
