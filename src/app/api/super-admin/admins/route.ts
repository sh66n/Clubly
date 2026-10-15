import { auth } from "@/auth";
import {
  getClubsWithAdmins,
  searchUsersForAdmin,
  assignClubRole,
  revokeClubRole,
} from "@/services/superAdminService";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super-admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");

  try {
    if (q !== null && q !== undefined) {
      const users = await searchUsersForAdmin(q);
      return NextResponse.json({ users });
    }

    const clubs = await getClubsWithAdmins();
    return NextResponse.json({ clubs });
  } catch (error: any) {
    console.error("SuperAdmin Admins GET Error:", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super-admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { userId, clubId, role } = body;

    if (!userId || !clubId || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (role !== "club-admin" && role !== "faculty-coordinator") {
      return NextResponse.json({ error: "Invalid role specified" }, { status: 400 });
    }

    await assignClubRole({
      userId,
      clubId,
      role,
      superAdminId: session.user.id,
    });

    return NextResponse.json({ success: true, message: `Successfully assigned ${role}` });
  } catch (error: any) {
    console.error("SuperAdmin Admins POST Error:", error);
    return NextResponse.json({ error: error.message || "Failed to assign role" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "super-admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const clubId = searchParams.get("clubId");

    if (!userId || !clubId) {
      return NextResponse.json({ error: "Missing userId or clubId" }, { status: 400 });
    }

    await revokeClubRole({
      userId,
      clubId,
      superAdminId: session.user.id,
    });

    return NextResponse.json({ success: true, message: "Role revoked successfully" });
  } catch (error: any) {
    console.error("SuperAdmin Admins DELETE Error:", error);
    return NextResponse.json({ error: error.message || "Failed to revoke role" }, { status: 500 });
  }
}
