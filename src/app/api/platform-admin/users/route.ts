import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { User, Organization } from "@/models";
import { withTenantContext } from "@/lib/getTenant";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "platform-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "";
    const tenantId = searchParams.get("tenantId") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectToDb();

    return await withTenantContext(null, async () => {
      const query: any = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ];
      }
      if (role) {
        query.role = role;
      }
      if (tenantId) {
        query.tenantId = tenantId;
      }

      const [users, total] = await Promise.all([
        User.find(query)
          .populate("tenantId", "name slug")
          .sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .limit(limit)
          .lean(),
        User.countDocuments(query),
      ]);

      return NextResponse.json({
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    });
  } catch (error: any) {
    console.error("Error fetching platform users:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "platform-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { userId, role, tenantId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    await connectToDb();

    return await withTenantContext(null, async () => {
      const updateData: any = {};
      if (role) updateData.role = role;
      if (tenantId !== undefined) updateData.tenantId = tenantId || null;

      const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
        .populate("tenantId", "name slug")
        .lean();

      if (!updatedUser) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
        user: updatedUser,
        message: "User updated successfully",
      });
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
