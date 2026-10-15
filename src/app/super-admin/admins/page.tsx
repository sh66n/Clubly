import { getClubsWithAdmins } from "@/services/superAdminService";
import AdminAssigner from "@/components/SuperAdmin/AdminAssigner";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Leadership Hub | Super Admin | Clubly",
};

export default async function SuperAdminAdminsPage() {
  const clubs = await getClubsWithAdmins();

  const allAdmins = clubs.flatMap((c) => c.admins);
  const totalCoordinators = clubs.filter((c) => c.facultyCoordinator).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Heading */}
      <div className="bg-[#18181d] border border-[#26252e] rounded-[28px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-[#f5f5fa] tracking-tight">
            Leadership &amp; Admin Allocation
          </h1>
          <p className="text-[12.5px] text-[#787787] mt-0.5">
            Appoint, manage, or revoke club-admins and faculty coordinators across college bodies
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-full bg-[#201f27] border border-[#2d2c38] text-xs text-[#a2a1b1]">
            {allAdmins.length} Active Admins
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-[#201f27] border border-[#2d2c38] text-xs text-[#a2a1b1]">
            {totalCoordinators} Coordinators
          </span>
        </div>
      </div>

      {/* Main Assigner */}
      <AdminAssigner initialClubs={clubs} />

      {/* Clubs Roster Grid */}
      <div className="bg-[#18181d] border border-[#26252e] rounded-[28px] p-6 space-y-5">
        <div>
          <h2 className="text-[16px] font-semibold text-[#f5f5fa]">
            All Campus Clubs &amp; Current Leadership
          </h2>
          <p className="text-[12px] text-[#787787] mt-0.5">
            Directory of {clubs.length} registered campus societies
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clubs.map((club) => (
            <div
              key={club.id}
              className="bg-[#1e1d24] border border-[#282732] rounded-[22px] p-4 flex flex-col justify-between hover:border-[#383745] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-[#292834]">
                  <div>
                    <h3 className="text-[14px] font-semibold text-[#f5f5fa]">
                      {club.name}
                    </h3>
                    <p className="text-[11px] text-[#717080]">
                      {club.department}
                    </p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2a1d25] text-[#c983a5] border border-[#4a2e40]">
                    {club.admins.length} Admins
                  </span>
                </div>

                <div className="mt-3 space-y-1.5">
                  <span className="text-[10px] font-semibold text-[#666574] uppercase tracking-wider block">
                    Active Admins
                  </span>
                  {club.admins.length === 0 ? (
                    <p className="text-xs text-[#6e6d7d] italic">Unassigned</p>
                  ) : (
                    <div className="space-y-1">
                      {club.admins.map((adm) => (
                        <div
                          key={adm.id}
                          className="flex items-center gap-2 text-xs text-[#d8d7e6]"
                        >
                          <div className="h-5 w-5 rounded-full bg-[#2d1e27] text-[10px] flex items-center justify-center text-[#e9b8d2] font-semibold shrink-0">
                            {adm.name?.[0]}
                          </div>
                          <span className="truncate">{adm.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mt-3 pt-2.5 border-t border-[#252430]">
                  <span className="text-[10px] font-semibold text-[#666574] uppercase tracking-wider block mb-1">
                    Faculty Coordinator
                  </span>
                  <p className="text-xs text-[#a2a1b1]">
                    {club.facultyCoordinator?.name || "Not Assigned"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
