import { connectToDb } from "@/lib/connectToDb";
import { Hackathon, HackathonTeam } from "@/models";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Users, MessageCircle, FileText, ArrowRight } from "lucide-react";

export default async function HackathonSuccessPage({ params }: { params: { id: string } }) {
  await connectToDb();
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const hackathon = await Hackathon.findById(params.id).lean();
  if (!hackathon) {
    notFound();
  }

  const team = await HackathonTeam.findOne({
    hackathon: params.id,
    "members.user": session.user.id
  }).lean();

  if (!team) {
    // If not in a team, redirect to hackathon details
    redirect(`/hackathons/${params.id}`);
  }

  return (
    <div className="container mx-auto py-12 px-4 flex flex-col items-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-2xl w-full text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="text-green-600" size={40} />
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Registration Successful!</h1>
        <p className="text-gray-600 mb-8 text-lg">
          You have successfully registered for <span className="font-semibold text-gray-900">{hackathon.name}</span>.
        </p>

        <div className="bg-gray-50 rounded-xl p-6 text-left space-y-6 mb-8 border">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
              <Users size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Your Team ID</h3>
              <p className="text-sm text-gray-500 font-mono bg-gray-200 px-2 py-1 rounded mt-1 inline-block">
                {team.teamId || team._id.toString().substring(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {hackathon.whatsappGroupLink && (
            <div className="flex items-start gap-4">
              <div className="bg-green-100 p-3 rounded-lg text-green-600">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Join the Community</h3>
                <p className="text-sm text-gray-500 mb-2">Join the official WhatsApp group for announcements and support.</p>
                <a 
                  href={hackathon.whatsappGroupLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center gap-1"
                >
                  Join WhatsApp Group <ArrowRight size={16} />
                </a>
              </div>
            </div>
          )}

          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-3 rounded-lg text-purple-600">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Next Steps: Round 1 Submission</h3>
              <p className="text-sm text-gray-500 mb-2">
                Prepare your presentation based on the problem statement. The submission portal is open.
              </p>
              {hackathon.submissionConfig?.templateUrl && (
                <a 
                  href={hackathon.submissionConfig.templateUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-purple-600 hover:text-purple-700 text-sm font-medium block"
                >
                  Download PPT Template
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link 
            href={`/hackathons/${params.id}`}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/hackathons"
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            Explore More Hackathons
          </Link>
        </div>
      </div>
    </div>
  );
}
