import { auth } from "@/auth";
import { redirect } from "next/navigation";
import CertificateForm from "@/components/Certificates/CertificateForm";

export default async function NewCertificatePage() {
  const session = await auth();
  if (!session || session.user.role !== "club-admin" || !session.user.adminClub) {
    redirect("/login");
  }

  return <CertificateForm />;
}
