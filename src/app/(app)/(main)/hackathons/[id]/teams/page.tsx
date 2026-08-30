import { connectToDb } from "@/lib/connectToDb";
import { Hackathon, HackathonTeam } from "@/models";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import TeamFormation from "@/components/Hackathons/TeamFormation";
import BackButton from "@/components/BackButton";

export default async function TeamFormationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectToDb();
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const hackathon = await Hackathon.findById(id).lean();

  if (!hackathon) {
    notFound();
  }

  const userTeam = await HackathonTeam.findOne({
    hackathon: id,
    members: session.user.id,
  })
    .populate("members", "name email image department year")
    .populate("leader", "name email image department year")
    .lean();

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <BackButton link={`/hackathons/${id}`} />
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">
          Team Formation: {hackathon.name}
        </h1>
        <p className="text-xs sm:text-sm text-gray-400 mt-1">
          Create a new team, enter a private invitation code, or find teammates in the public directory.
        </p>
      </div>

      <TeamFormation
        hackathon={JSON.parse(JSON.stringify(hackathon))}
        userTeam={userTeam ? JSON.parse(JSON.stringify(userTeam)) : null}
        currentUser={session.user}
      />
    </div>
  );
}
