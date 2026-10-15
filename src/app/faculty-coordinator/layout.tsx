import { auth } from "@/auth";
import { redirect } from "next/navigation";
import FacultyCoordinatorClientLayout from "@/components/FacultyCoordinator/FacultyCoordinatorClientLayout";

export const metadata = {
  title: "Faculty Coordinator Portal | Clubly",
};

export default async function FacultyCoordinatorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Server-side auth check
  if (!session?.user) {
    redirect("/login?callbackUrl=/faculty-coordinator/dashboard");
  }

  if (session.user.role !== "faculty-coordinator") {
    redirect("/forbidden");
  }

  if (!session.user.adminClub) {
    redirect("/forbidden");
  }

  return (
    <FacultyCoordinatorClientLayout user={session.user}>
      {children}
    </FacultyCoordinatorClientLayout>
  );
}
