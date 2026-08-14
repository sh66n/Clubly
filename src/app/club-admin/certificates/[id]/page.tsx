import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Certificate } from "@/models/certificate.model";
import { redirect } from "next/navigation";
import CertificateForm from "@/components/Certificates/CertificateForm";

export default async function EditCertificatePage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
    redirect("/login");
  }

  await connectToDb();
  const { id } = await params;
  const certificate = await Certificate.findById(id).lean();

  if (!certificate || certificate.club.toString() !== session.user.adminClub.toString()) {
    redirect("/club-admin/certificates");
  }

  // Convert all ObjectIds, subdocument _ids and Dates into plain JSON primitives for client component
  const initialData = JSON.parse(JSON.stringify(certificate));

  return <CertificateForm initialData={initialData} />;
}
