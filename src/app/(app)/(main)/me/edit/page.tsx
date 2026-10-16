import { auth } from "@/auth";
import BackButton from "@/components/BackButton";
import BorderedDiv from "@/components/BorderedDiv";
import ProfileEditForm from "@/components/User/ProfileEditForm";
import { getUserById } from "@/services/getUserById";
import { User } from "lucide-react";
import React from "react";

export default async function Settings() {
  const session = await auth();
  const user = session?.user?.id ? await getUserById(session.user.id) : null;

  return (
    <div className="min-h-full">
      <BackButton />
      <h1 className="text-5xl font-semibold">Edit Profile</h1>
      <div className="mt-2 mb-6 text-[#717171]">
        Update your profile details and information
      </div>

      <ProfileEditForm user={user} />
    </div>
  );
}
