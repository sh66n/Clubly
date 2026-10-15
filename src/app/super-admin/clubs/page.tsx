import { getClubsWithAdmins } from "@/services/superAdminService";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Clubs Directory | Super Admin | Clubly",
};

export default async function SuperAdminClubsPage() {
  const clubs = await getClubsWithAdmins();

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-[#18181d] border border-[#26252e] rounded-[28px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-semibold text-[#f5f5fa] tracking-tight">
            Campus Clubs &amp; Societies Directory
          </h1>
          <p className="text-[12.5px] text-[#787787] mt-0.5">
            Overview of all recognized college clubs, student leadership allocations, and departments
          </p>
        </div>

        <Link
          href="/super-admin/admins"
          className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#6e465c] via-[#85536e] to-[#6e465c] text-white text-xs font-medium self-start sm:self-auto shadow-sm hover:opacity-95 transition-opacity"
        >
          Assign Leaders &rarr;
        </Link>
      </div>

      {/* Clubs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clubs.map((club) => (
          <div
            key={club.id}
            className="bg-[#18181d] border border-[#26252e] rounded-[26px] p-5 flex flex-col justify-between hover:border-[#383745] transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#24232c]">
                <div>
                  <h2 className="text-[15px] font-semibold text-[#f5f5fa]">
                    {club.name}
                  </h2>
                  <span className="text-[11px] text-[#787787]">
                    {club.department}
                  </span>
                </div>

                <Link
                  href={`/clubs/${club.id}`}
                  target="_blank"
                  className="p-1.5 rounded-full bg-[#201f27] border border-[#2c2b36] text-[#8e8d9e] hover:text-white transition-colors"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <p className="text-xs text-[#828192] mt-3 line-clamp-2 leading-relaxed">
                {club.fullName || club.name}
              </p>

              <div className="mt-4 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#6d6c7c]">Club Admins:</span>
                  <span className="text-[#e2e1ec] font-medium">
                    {club.admins.length > 0
                      ? club.admins.map((a) => a.name).join(", ")
                      : "None"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#6d6c7c]">Faculty:</span>
                  <span className="text-[#c595ad] font-medium">
                    {club.facultyCoordinator?.name || "None"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-[#22212a] flex items-center justify-between text-xs">
              <span className="text-[#6a6977]">Status: Active</span>
              <Link
                href="/super-admin/admins"
                className="text-[#9e6883] hover:text-[#c48ba8] font-medium transition-colors"
              >
                Configure &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
