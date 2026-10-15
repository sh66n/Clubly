import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectToDb } from "@/lib/connectToDb";
import { Organization, User, Club, Event } from "@/models";
import { withTenantContext } from "@/lib/getTenant";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "platform-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    await connectToDb();

    return await withTenantContext(null, async () => {
      const org = await Organization.findById(id).lean();
      if (!org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      const [userCount, clubCount, eventCount] = await Promise.all([
        User.countDocuments({ tenantId: org._id }),
        Club.countDocuments({ tenantId: org._id }),
        Event.countDocuments({ tenantId: org._id }),
      ]);

      return NextResponse.json({
        organization: {
          ...org,
          userCount,
          clubCount,
          eventCount,
        },
      });
    });
  } catch (error: any) {
    console.error("Error fetching tenant:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "platform-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    const body = await req.json();
    await connectToDb();

    return await withTenantContext(null, async () => {
      const org = await Organization.findById(id);
      if (!org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      // Check slug uniqueness if slug changed
      if (body.slug && body.slug !== org.slug) {
        const cleanSlug = body.slug
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9-]/g, "-")
          .replace(/-+/g, "-")
          .replace(/^-|-$/g, "");

        const existing = await Organization.findOne({ slug: cleanSlug, _id: { $ne: org._id } });
        if (existing) {
          return NextResponse.json(
            { error: `Subdomain '${cleanSlug}' is already taken.` },
            { status: 409 }
          );
        }
        org.slug = cleanSlug;
      }

      if (body.name !== undefined) org.name = body.name.trim();
      if (body.logo !== undefined) org.logo = body.logo;
      if (body.contactEmail !== undefined) org.contactEmail = body.contactEmail?.trim().toLowerCase();
      if (body.plan !== undefined) org.plan = body.plan;
      if (body.primaryColor !== undefined) org.primaryColor = body.primaryColor;
      if (body.status !== undefined) org.status = body.status;

      if (body.allowedEmailDomains !== undefined) {
        org.allowedEmailDomains = Array.isArray(body.allowedEmailDomains)
          ? body.allowedEmailDomains.map((d: string) => d.toLowerCase().trim()).filter(Boolean)
          : String(body.allowedEmailDomains)
              .split(",")
              .map((d: string) => d.toLowerCase().trim())
              .filter(Boolean);
      }

      if (body.departments !== undefined) {
        org.departments = Array.isArray(body.departments)
          ? body.departments.map((d: string) => d.trim()).filter(Boolean)
          : String(body.departments)
              .split(",")
              .map((d: string) => d.trim())
              .filter(Boolean);
      }

      await org.save();

      return NextResponse.json({
        organization: org,
        message: "Organization updated successfully",
      });
    });
  } catch (error: any) {
    console.error("Error updating tenant:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "platform-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid organization ID" }, { status: 400 });
    }

    await connectToDb();

    return await withTenantContext(null, async () => {
      // Soft-delete by setting status to suspended
      const org = await Organization.findByIdAndUpdate(
        id,
        { status: "suspended" },
        { new: true }
      );

      if (!org) {
        return NextResponse.json({ error: "Organization not found" }, { status: 404 });
      }

      return NextResponse.json({
        organization: org,
        message: "Organization suspended successfully",
      });
    });
  } catch (error: any) {
    console.error("Error deleting tenant:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
