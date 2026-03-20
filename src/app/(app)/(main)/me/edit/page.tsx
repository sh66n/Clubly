import { auth } from "@/auth";
import BorderedDiv from "@/components/BorderedDiv";
import ProfileEditForm from "@/components/User/ProfileEditForm";
import { User } from "lucide-react";
import React from "react";

const getUser = async (userId: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/users/${userId}`,
  );

  if (!res.ok) return null;
  const user = await res.json();
  return user;
};

export default async function Settings() {
  const session = await auth();
  const user = await getUser(session?.user?.id);

  return (
    <div className="min-h-full">
      <h1 className="text-5xl font-semibold">Your Settings</h1>
      <div className="mt-2 mb-6 text-[#717171]">
        Manage your profile and account preferences
      </div>

      <ProfileEditForm user={user} />
    </div>
  );
}
