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

  // Convert ObjectIds and Dates for client component
  const initialData = {
    ...certificate,
    _id: certificate._id.toString(),
    club: certificate.club.toString(),
    uploadedAt: certificate.uploadedAt.toISOString(),
    createdAt: certificate.createdAt?.toISOString(),
    updatedAt: certificate.updatedAt?.toISOString(),
  };

  return <CertificateForm initialData={initialData} />;
}
