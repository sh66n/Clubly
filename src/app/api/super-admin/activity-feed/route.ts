import { auth } from "@/auth";
import { getSuperAdminDashboardData } from "@/services/superAdminService";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user || session.user.role !== "super-admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const data = await getSuperAdminDashboardData();
    return NextResponse.json({
      activities: data.recentActivities,
      monthlyPerformance: data.monthlyPerformance,
    });
  } catch (error: any) {
    console.error("SuperAdmin Activity Feed Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
