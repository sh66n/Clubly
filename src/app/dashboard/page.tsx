import { auth } from "@/auth";
import Image from "next/image";
import React from "react";

export default async function Dashboard() {
  const session = await auth();

  return (
    <div>
      <Image src={session?.user?.image} width={50} height={50} alt="" />
      {session?.user.name}
    </div>
  );
}
