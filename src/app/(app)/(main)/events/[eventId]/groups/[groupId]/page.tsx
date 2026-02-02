import BorderedDiv from "@/components/BorderedDiv";
import UserCard from "@/components/Events/UserCard";
import GroupCard from "@/components/Groups/GroupCard";
import JoinGroupForm from "@/components/Groups/JoinGroupForm";
import BackButton from "@/components/BackButton";
import { Globe, Lock, Users, Crown } from "lucide-react";
import { headers } from "next/headers";
import React from "react";
import RemoveMemberButton from "@/components/Groups/RemoveMemberButton";
import { auth } from "@/auth";
import DisbandGroupButton from "@/components/Groups/DisbandGroupButton";
import EditGroupForm from "@/components/Groups/EditGroupForm";
import EditGroupButton from "@/components/Groups/EditGroupButton";

const getGroup = async (eventId: string, groupId: string) => {
  const nextHeaders = await headers();
  const cookieHeader = nextHeaders.get("cookie") ?? "";

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/events/${eventId}/groups/${groupId}`,
    {
      headers: { cookie: cookieHeader },
      cache: "no-store",
    },
  );

  if (!res.ok) return null;
  return res.json();
};

export default async function GroupDetails({
  params,
}: {
  params: Promise<{ eventId: string; groupId: string }>;
}) {
  const session = await auth();
  const { eventId, groupId } = await params;
  const group = await getGroup(eventId, groupId);

  if (!group)
    return (
      <div className="text-gray-500 p-10 text-center">Group not found.</div>
    );

  // Check if current user is the leader
  const isLeader = session?.user?.id === group.leader._id;

  return (
    <div className="max-w-6xl">
      {/* 1. Navigation */}
      <BackButton link={`/events/${eventId}/groups`} />

      {/* 2. Responsive Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mt-6">
        {/* Main Content: Group Identity & Actions */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-4">
              {group.isPublic ? (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-500 text-[10px] font-bold uppercase tracking-wider">
                  <Globe size={12} /> Public Group
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-[10px] font-bold uppercase tracking-wider">
                  <Lock size={12} /> Private Group
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tighter mb-4">
              {group.name}
            </h1>

            <div className="flex items-center gap-6 text-gray-500 text-sm">
              <div className="flex items-center gap-2">
                <Users size={16} />
                <span>
                  {group.members.length} / {group.capacity} Members
                </span>
              </div>
            </div>
          </section>

          <div className="max-w-md">
            <JoinGroupForm eventId={eventId} group={group} />
          </div>
        </div>

        {/* Sidebar: Member List */}
        <aside className="space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-4 flex items-center gap-2">
              Team Members
            </h3>

            <div className="space-y-3">
              {/* Leader Card */}
              <div className="relative group">
                <div className="absolute -left-2 top-1/2 -translate-y-1/2 text-amber-500">
                  <Crown size={14} />
                </div>
                <UserCard user={group.leader} />
              </div>

              {/* Other Members */}
              {group.members
                .filter((m: any) => m._id !== group.leader._id)
                .map((member: any) => (
                  <UserCard
                    key={member._id}
                    user={member}
                    action={
                      // Only render the button if the viewer is the leader
                      isLeader && (
                        <RemoveMemberButton
                          groupId={group._id}
                          userId={member._id}
                          eventId={eventId}
                          userName={member.name}
                        />
                      )
                    }
                  />
                ))}

              {/* Empty Slots */}
              {Array.from({
                length: group.capacity - group.members.length,
              }).map((_, i) => (
                <div
                  key={i}
                  className="h-[60px] rounded-xl border border-[#2A2A2A] border-dashed flex items-center px-4 text-gray-700 text-sm italic"
                >
                  Empty Slot
                </div>
              ))}
            </div>
          </div>
          {isLeader && (
            <div className="flex flex-col gap-4">
              <EditGroupButton eventId={eventId} groupId={group._id} />
              <DisbandGroupButton eventId={eventId} groupId={group._id} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
