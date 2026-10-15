import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Organization, User, Club, Event } from "@/models";
import { withTenantContext } from "@/lib/getTenant";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "platform-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectToDb();

    return await withTenantContext(null, async () => {
      const [
        totalTenants,
        activeTenants,
        suspendedTenants,
        trialTenants,
        totalUsers,
        totalClubs,
        totalEvents,
        recentTenants,
      ] = await Promise.all([
        Organization.countDocuments({}),
        Organization.countDocuments({ status: "active" }),
        Organization.countDocuments({ status: "suspended" }),
        Organization.countDocuments({ status: "trial" }),
        User.countDocuments({}),
        Club.countDocuments({}),
        Event.countDocuments({}),
        Organization.find({}).sort({ createdAt: -1 }).limit(5).lean(),
      ]);

      return NextResponse.json({
        stats: {
          totalTenants,
          activeTenants,
          suspendedTenants,
          trialTenants,
          totalUsers,
          totalClubs,
          totalEvents,
        },
        recentTenants,
      });
    });
  } catch (error: any) {
    console.error("Error fetching platform stats:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
