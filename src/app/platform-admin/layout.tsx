import React from "react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import PlatformAdminClientLayout from "@/components/PlatformAdmin/PlatformAdminClientLayout";

export default async function PlatformAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/platform-admin");
  }

  if (session.user.role !== "platform-admin") {
    redirect("/forbidden");
  }

  return (
    <PlatformAdminClientLayout user={session.user}>
      {children}
    </PlatformAdminClientLayout>
  );
}
