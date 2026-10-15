import { auth } from "@/auth";
import { redirect } from "next/navigation";
import SuperAdminClientLayout from "@/components/SuperAdmin/SuperAdminClientLayout";

export const metadata = {
  title: "Super Admin | Clubly College Management",
  description: "Overall College Administration & Club Admin Management",
};

export default async function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  // Server-side auth check
  if (!session?.user) {
    redirect("/login?callbackUrl=/super-admin");
  }

  if (session.user.role !== "super-admin") {
    redirect("/forbidden");
  }

  return (
    <SuperAdminClientLayout user={session.user}>
      {children}
    </SuperAdminClientLayout>
  );
}
