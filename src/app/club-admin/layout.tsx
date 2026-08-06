import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClubAdminClientLayout from "@/components/ClubAdmin/ClubAdminClientLayout";

export const metadata = {
  title: "Club Admin | Clubly",
};

export default async function ClubAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Server-side auth check (belt-and-suspenders with middleware)
  if (!session?.user) {
    redirect("/login?callbackUrl=/club-admin/dashboard");
  }

  if (session.user.role !== "club-admin") {
    redirect("/forbidden");
  }

  return (
    <ClubAdminClientLayout user={session.user}>
      {children}
    </ClubAdminClientLayout>
  );
}
