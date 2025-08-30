import { auth } from "@/auth";
import Image from "next/image";
import { redirect } from "next/navigation";
import React from "react";

export default async function Dashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div>
      <Image src={session?.user?.image} width={50} height={50} alt="" />
      {session?.user.name}
    </div>
  );
}
