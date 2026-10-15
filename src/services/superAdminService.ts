import { connectToDb } from "@/lib/connectToDb";
import { User, Club, Event, Registration, AuditLog } from "@/models";
import mongoose from "mongoose";

export interface SuperAdminDashboardStats {
  totalStudents: number;
  totalClubs: number;
  totalEvents: number;
  totalRegistrations: number;
  activeAdminsCount: number;
  monthlyPerformance: {
    month: string;
    registrations: number;
    events: number;
  }[];
  recentActivities: {
    id: string;
    type: "audit" | "registration" | "event";
    title: string;
    description: string;
    timestamp: string;
    createdAt: string;
    badge?: string;
    user?: {
      name: string;
      email: string;
      image?: string;
    };
    club?: {
      name: string;
      logo?: string;
    };
  }[];
}

/**
 * Fetch high-level college metrics and performance curve
 */
export async function getSuperAdminDashboardData(): Promise<SuperAdminDashboardStats> {
  await connectToDb();

  const [
    totalStudents,
    totalClubs,
    totalEvents,
    totalRegistrations,
    activeAdminsCount,
  ] = await Promise.all([
    User.countDocuments({ role: { $in: ["user", "club-admin"] } }),
    Club.countDocuments({}),
    Event.countDocuments({}),
    Registration.countDocuments({}),
    User.countDocuments({ role: { $in: ["club-admin", "faculty-coordinator"] } }),
  ]);

  // Generate 6-month monthly trend data for the performance sparkline chart
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const now = new Date();
  const monthlyPerformance: { month: string; registrations: number; events: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const nextD = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
    const monthLabel = monthNames[d.getMonth()];

    const [regs, evs] = await Promise.all([
      Registration.countDocuments({
        createdAt: { $gte: d, $lt: nextD },
      }),
      Event.countDocuments({
        createdAt: { $gte: d, $lt: nextD },
      }),
    ]);

    monthlyPerformance.push({
      month: monthLabel,
      registrations: regs,
      events: evs,
    });
  }

  // Live Activity Feed: Atlas Free-Tier Safe
  // 1. Fetch recent high-value audit logs (role changes, club admin assignments)
  const auditLogs = await AuditLog.find({})
    .sort({ createdAt: -1 })
    .limit(15)
    .populate("performedBy", "name email image")
    .populate("targetUser", "name email image")
    .populate("targetClub", "name logo")
    .lean();

  // 2. Fetch latest student event registrations (lean indexed query)
  const latestRegistrations = await Registration.find({})
    .sort({ createdAt: -1 })
    .limit(15)
    .populate("userId", "name email image department")
    .populate({
      path: "eventId",
      select: "name organizingClub",
      populate: { path: "organizingClub", select: "name logo" },
    })
    .lean();

  // Merge and sort in-memory
  const unifiedActivities: any[] = [];

  for (const log of auditLogs) {
    const actor = log.performedBy as any;
    const target = log.targetUser as any;
    const club = log.targetClub as any;

    unifiedActivities.push({
      id: log._id.toString(),
      type: "audit",
      title: formatAuditActionTitle(log.action),
      description: log.details || "Administrative modification made",
      timestamp: formatTimeAgo(log.createdAt),
      createdAt: new Date(log.createdAt).toISOString(),
      badge: log.action.includes("REVOKE") ? "Demoted" : "Promoted",
      user: actor ? { name: actor.name, email: actor.email, image: actor.image } : undefined,
      club: club ? { name: club.name, logo: club.logo } : undefined,
      targetUser: target ? { name: target.name, email: target.email } : undefined,
    });
  }

  for (const reg of latestRegistrations) {
    const u = reg.userId as any;
    const ev = reg.eventId as any;
    const club = ev?.organizingClub as any;

    if (u) {
      const regId = (reg as any)._id?.toString() || "";
      const regCreated = (reg as any).createdAt || new Date();
      unifiedActivities.push({
        id: regId,
        type: "registration",
        title: `${u.name || "Student"} registered for ${ev?.name || "an Event"}`,
        description: club?.name ? `Organized by ${club.name}` : "Campus event registration",
        timestamp: formatTimeAgo(regCreated),
        createdAt: new Date(regCreated).toISOString(),
        badge: "Registration",
        user: { name: u.name, email: u.email, image: u.image },
        club: club ? { name: club.name, logo: club.logo } : undefined,
      });
    }
  }

  // Sort descending by timestamp
  unifiedActivities.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    totalStudents,
    totalClubs,
    totalEvents,
    totalRegistrations,
    activeAdminsCount,
    monthlyPerformance,
    recentActivities: unifiedActivities.slice(0, 20),
  };
}

/**
 * Search users by query (name or email)
 */
export async function searchUsersForAdmin(query: string) {
  await connectToDb();
  if (!query || query.trim().length === 0) return [];

  const regex = new RegExp(query.trim(), "i");
  const users = await User.find(
    {
      $or: [{ name: regex }, { email: regex }],
    },
    {
      name: 1,
      email: 1,
      image: 1,
      role: 1,
      adminClub: 1,
      department: 1,
      year: 1,
    }
  )
    .populate("adminClub", "name logo")
    .limit(20)
    .lean();

  return users.map((u: any) => ({
    id: u._id.toString(),
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role,
    department: u.department,
    year: u.year,
    adminClub: u.adminClub
      ? { id: u.adminClub._id.toString(), name: u.adminClub.name, logo: u.adminClub.logo }
      : null,
  }));
}

/**
 * Fetch all clubs with their assigned admins & faculty coordinator
 */
export async function getClubsWithAdmins() {
  await connectToDb();

  const clubs = await Club.find({})
    .populate("admins", "name email image role department year")
    .populate("facultyCoordinator", "name email image role department")
    .sort({ name: 1 })
    .lean();

  // Find any club-admins whose user.adminClub points to this club (backwards-compat)
  const allClubAdmins = await User.find(
    { role: "club-admin", adminClub: { $ne: null } },
    { name: 1, email: 1, image: 1, role: 1, adminClub: 1, department: 1, year: 1 }
  ).lean();

  return clubs.map((c: any) => {
    const clubIdStr = c._id.toString();
    const explicitAdmins = (c.admins || []).map((a: any) => ({
      id: a._id.toString(),
      name: a.name,
      email: a.email,
      image: a.image,
      role: a.role,
      department: a.department,
      year: a.year,
    }));

    // Merge in users where user.adminClub matches but not yet in admins array
    const legacyAdmins = allClubAdmins
      .filter((u: any) => u.adminClub?.toString() === clubIdStr)
      .map((u: any) => ({
        id: u._id.toString(),
        name: u.name,
        email: u.email,
        image: u.image,
        role: u.role,
        department: u.department,
        year: u.year,
      }));

    // Deduplicate admins by user id
    const adminMap = new Map<string, any>();
    for (const a of [...explicitAdmins, ...legacyAdmins]) {
      adminMap.set(a.id, a);
    }

    return {
      id: clubIdStr,
      name: c.name,
      fullName: c.fullName,
      department: c.department,
      logo: c.logo,
      facultyCoordinator: c.facultyCoordinator
        ? {
            id: c.facultyCoordinator._id.toString(),
            name: c.facultyCoordinator.name,
            email: c.facultyCoordinator.email,
            image: c.facultyCoordinator.image,
          }
        : null,
      admins: Array.from(adminMap.values()),
    };
  });
}

/**
 * Assign a user as club-admin or faculty-coordinator
 */
export async function assignClubRole({
  userId,
  clubId,
  role,
  superAdminId,
}: {
  userId: string;
  clubId: string;
  role: "club-admin" | "faculty-coordinator";
  superAdminId: string;
}) {
  await connectToDb();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const club = await Club.findById(clubId);
  if (!club) throw new Error("Club not found");

  const superAdmin = await User.findById(superAdminId);

  // Update user
  user.role = role;
  user.adminClub = new mongoose.Types.ObjectId(clubId);
  await user.save();

  // Update club
  if (role === "club-admin") {
    const adminObjId = new mongoose.Types.ObjectId(userId);
    if (!club.admins) club.admins = [];
    const exists = club.admins.some((id: any) => id.toString() === userId);
    if (!exists) {
      club.admins.push(adminObjId);
    }
  } else if (role === "faculty-coordinator") {
    club.facultyCoordinator = new mongoose.Types.ObjectId(userId);
  }
  await club.save();

  // Create lightweight audit log
  await AuditLog.create({
    tenantId: club.tenantId || superAdmin?.tenantId,
    action: role === "club-admin" ? "ASSIGN_CLUB_ADMIN" : "ASSIGN_FACULTY",
    performedBy: new mongoose.Types.ObjectId(superAdminId),
    targetUser: user._id,
    targetClub: club._id,
    details: `${superAdmin?.name || "Super Admin"} appointed ${user.name} (${user.email}) as ${role} of ${club.name}`,
    metadata: {
      role,
      userEmail: user.email,
      clubName: club.name,
    },
  });

  return { success: true };
}

/**
 * Revoke club-admin or faculty-coordinator role
 */
export async function revokeClubRole({
  userId,
  clubId,
  superAdminId,
}: {
  userId: string;
  clubId: string;
  superAdminId: string;
}) {
  await connectToDb();

  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const club = await Club.findById(clubId);
  if (!club) throw new Error("Club not found");

  const superAdmin = await User.findById(superAdminId);
  const previousRole = user.role;

  // Demote user to regular user and clear primary adminClub
  user.role = "user";
  user.adminClub = undefined;
  await user.save();

  // Remove from club
  if (club.admins && club.admins.length > 0) {
    club.admins = club.admins.filter((id: any) => id.toString() !== userId);
  }
  if (club.facultyCoordinator?.toString() === userId) {
    club.facultyCoordinator = undefined;
  }
  await club.save();

  // Audit Log
  await AuditLog.create({
    tenantId: club.tenantId || superAdmin?.tenantId,
    action: previousRole === "faculty-coordinator" ? "REVOKE_FACULTY" : "REVOKE_CLUB_ADMIN",
    performedBy: new mongoose.Types.ObjectId(superAdminId),
    targetUser: user._id,
    targetClub: club._id,
    details: `${superAdmin?.name || "Super Admin"} revoked ${previousRole} privileges from ${user.name} for ${club.name}`,
    metadata: {
      previousRole,
      userEmail: user.email,
      clubName: club.name,
    },
  });

  return { success: true };
}

function formatAuditActionTitle(action: string): string {
  switch (action) {
    case "ASSIGN_CLUB_ADMIN":
      return "Club Admin Appointed";
    case "REVOKE_CLUB_ADMIN":
      return "Club Admin Demoted";
    case "ASSIGN_FACULTY":
      return "Faculty Coordinator Appointed";
    case "REVOKE_FACULTY":
      return "Faculty Coordinator Removed";
    case "CREATE_CLUB":
      return "New Club Registered";
    case "UPDATE_CLUB":
      return "Club Settings Modified";
    default:
      return "Campus Activity";
  }
}

function formatTimeAgo(dateInput: Date | string): string {
  const d = new Date(dateInput);
  const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);

  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return "yesterday";
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}
