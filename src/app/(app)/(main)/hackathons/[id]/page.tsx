import { connectToDb } from "@/lib/connectToDb";
import { Hackathon, HackathonTeam, HackathonRound, HackathonRegistration } from "@/models";
import { auth } from "@/auth";
import HackathonDetails from "@/components/Hackathons/HackathonDetails";
import BackButton from "@/components/BackButton";
import { notFound } from "next/navigation";

export default async function HackathonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connectToDb();
  const { id } = await params;
  const session = await auth();

  const hackathon = await Hackathon.findById(id)
    .populate("organizingClub")
    .populate("contact", "name email image department year phoneNumber")
    .lean();

  if (!hackathon) {
    notFound();
  }

  const rounds = await HackathonRound.find({ hackathon: id })
    .sort({ roundNumber: 1 })
    .lean();

  let userTeam = null;
  let userRegistration = null;

  if (session?.user?.id) {
    userTeam = await HackathonTeam.findOne({
      hackathon: id,
      members: session.user.id,
    })
      .populate("members", "name email image department year phoneNumber")
      .populate("leader", "name email image department year phoneNumber")
      .lean();

    if (userTeam) {
      userRegistration = await HackathonRegistration.findOne({
        hackathon: id,
        team: userTeam._id,
      }).lean();
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      <BackButton link={"/events"} />
      <HackathonDetails
        hackathon={JSON.parse(JSON.stringify(hackathon))}
        rounds={JSON.parse(JSON.stringify(rounds))}
        userTeam={userTeam ? JSON.parse(JSON.stringify(userTeam)) : null}
        userRegistration={userRegistration ? JSON.parse(JSON.stringify(userRegistration)) : null}
        userId={session?.user?.id}
      />
    </div>
  );
}
