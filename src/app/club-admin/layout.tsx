import { auth } from "@/auth";
import { redirect } from "next/navigation";
import ClubAdminSidebar from "@/components/ClubAdmin/ClubAdminSidebar";
import ClubAdminHeader from "@/components/ClubAdmin/ClubAdminHeader";

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
    <div className="flex min-h-screen bg-[#f5f5f5]">
      {/* Sidebar */}
      <ClubAdminSidebar user={session.user} />

      {/* Main area */}
      <div className="flex-1 md:ml-[var(--club-admin-sidebar-width,17rem)] transition-all duration-300 flex flex-col">
        {/* Top header */}
        <ClubAdminHeader user={session.user} />

        {/* Page content */}
        <main className="flex-1 px-4 md:px-6 pt-6 pb-6">{children}</main>
      </div>
    </div>
  );
}
