import { getSuperAdminDashboardData } from "@/services/superAdminService";
import ActivityFeed from "@/components/SuperAdmin/ActivityFeed";

export const metadata = {
  title: "Live Campus Activity | Super Admin | Clubly",
};

export default async function SuperAdminActivityPage() {
  const stats = await getSuperAdminDashboardData();

  return (
    <div className="space-y-6">
      
      <div className="bg-[#18181d] border border-[#26252e] rounded-[28px] p-6">
        <h1 className="text-[22px] font-semibold text-[#f5f5fa] tracking-tight">
          Live Campus Activity &amp; Audit Stream
        </h1>
        <p className="text-[12.5px] text-[#787787] mt-0.5">
          Real-time, database-safe stream of registrations, appointments, and society activities
        </p>
      </div>

      <div className="bg-[#18181d] border border-[#26252e] rounded-[28px] p-6">
        <ActivityFeed initialActivities={stats.recentActivities} />
      </div>

    </div>
  );
}
