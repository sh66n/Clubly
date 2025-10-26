import React from "react";
import Image from "next/image";
import Link from "next/link";
import BorderedDiv from "@/components/BorderedDiv";
import { getUserById } from "@/services/getUserById";
import { getEventsAttendedByUser } from "@/services/getEventsAttendedByUser";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getUserById(id);

  // Compute total points
  const totalPoints =
    user.points?.reduce((sum, p) => sum + (p.points || 0), 0) ?? 0;

  const eventsAttended = await getEventsAttendedByUser(user._id);

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Profile card */}
          <div>
            <BorderedDiv className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <div className="flex flex-col items-center">
                <div className="w-28 h-28 rounded-full overflow-hidden mb-4">
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={112}
                    height={112}
                    className="object-cover"
                  />
                </div>

                <h2 className="text-xl font-semibold text-white">
                  {user.name}
                </h2>
                <p className="text-sm text-blue-400 mb-1">
                  Computer Engineering
                </p>
                <p className="text-sm text-gray-300">idk • Student</p>

                <div className="mt-4 text-center">
                  <p className="text-yellow-400 font-bold">
                    {totalPoints ?? 0} Points
                  </p>
                </div>
              </div>
            </BorderedDiv>

            {/* quick stats */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="bg-black/30 p-3 rounded-lg text-center border border-gray-700">
                <div className="text-lg font-semibold">{totalPoints ?? 0}</div>
                <div className="text-xs text-gray-300">Points</div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg text-center border border-gray-700">
                <div className="text-lg font-semibold">{eventsAttended}</div>
                <div className="text-xs text-gray-300">Events</div>
              </div>
              <div className="bg-black/30 p-3 rounded-lg text-center border border-gray-700">
                <div className="text-lg font-semibold">3</div>
                <div className="text-xs text-gray-300">Clubs</div>
              </div>
            </div>
          </div>

          {/* RIGHT: Overview or Edit form */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="flex space-x-6">
                <button>Overview</button>
              </div>
            </div>

            <div className="bg-black/30 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
              <>
                <h3 className="text-xl font-semibold mb-3">About</h3>
                <p className="text-gray-300 leading-relaxed text-justify">
                  {user.bio ?? ""}
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm text-gray-400">Email</h4>
                    <p className="text-white">{user.email}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Role</h4>
                    <p className="text-white">Student</p>
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-400">Branch</h4>
                    <p className="text-white">{user.branch ?? "Not added"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Division</h4>
                    <p className="text-white">{user.division ?? "Not added"}</p>
                  </div>

                  <div>
                    <h4 className="text-sm text-gray-400">Phone</h4>
                    <p className="text-white">{user.phone ?? "Not added"}</p>
                  </div>
                  <div>
                    <h4 className="text-sm text-gray-400">Personal Mail</h4>
                    <p className="text-white">
                      {user.personalMail ?? "Not added"}
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <h4 className="text-sm text-gray-400">Address</h4>
                    <p className="text-white">{user.address ?? "Not added"}</p>
                  </div>
                </div>
              </>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
