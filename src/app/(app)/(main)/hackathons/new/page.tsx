import { auth } from "@/auth";
import { redirect } from "next/navigation";
import NewHackathonForm from "@/components/Hackathons/NewHackathonForm";

export default async function NewHackathonPage() {
  const session = await auth();

  if (session?.user?.role !== "club-admin") {
    redirect("/hackathons");
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Create New Hackathon</h1>
      <NewHackathonForm clubId={session.user.adminClub} />
    </div>
  );
}
