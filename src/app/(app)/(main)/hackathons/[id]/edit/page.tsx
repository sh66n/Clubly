import { connectToDb } from "@/lib/connectToDb";
import { Hackathon } from "@/models";
import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { EditHackathonForm } from "@/components/Hackathons/EditHackathonForm";

export default async function EditHackathonPage({ params }: { params: { id: string } }) {
  await connectToDb();
  const session = await auth();

  if (session?.user?.role !== "club-admin") {
    redirect("/hackathons");
  }

  const hackathon = await Hackathon.findById(params.id).lean();
  
  if (!hackathon) {
    notFound();
  }

  // Ensure the club admin is editing their own hackathon
  if (hackathon.organizingClub?.toString() !== session.user.adminClub) {
    redirect("/hackathons");
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Edit Hackathon</h1>
      <EditHackathonForm hackathon={JSON.parse(JSON.stringify(hackathon))} />
    </div>
  );
}
