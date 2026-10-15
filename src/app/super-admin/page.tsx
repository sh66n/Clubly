import { auth } from "@/auth";
import {
  getSuperAdminDashboardData,
  getClubsWithAdmins,
} from "@/services/superAdminService";
import SuperAdminDashboardClient from "@/components/SuperAdmin/SuperAdminDashboardClient";

export default async function SuperAdminDashboardPage() {
  const [stats, clubs] = await Promise.all([
    getSuperAdminDashboardData(),
    getClubsWithAdmins(),
  ]);

  return <SuperAdminDashboardClient stats={stats} clubs={clubs} />;
}
