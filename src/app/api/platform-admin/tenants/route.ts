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

    // Run without tenant filter to see all organizations and aggregate stats across all tenants
    return await withTenantContext(null, async () => {
      const organizations = await Organization.find({}).sort({ createdAt: -1 }).lean();

      // Gather counts per tenant
      const orgsWithStats = await Promise.all(
        organizations.map(async (org) => {
          const [userCount, clubCount, eventCount] = await Promise.all([
            User.countDocuments({ tenantId: org._id }),
            Club.countDocuments({ tenantId: org._id }),
            Event.countDocuments({ tenantId: org._id }),
          ]);

          return {
            ...org,
            userCount,
            clubCount,
            eventCount,
          };
        })
      );

      return NextResponse.json({ organizations: orgsWithStats });
    });
  } catch (error: any) {
    console.error("Error fetching tenants:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "platform-admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const {
      name,
      slug,
      allowedEmailDomains,
      departments,
      contactEmail,
      plan,
      logo,
      primaryColor,
      status,
    } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and subdomain slug are required" },
        { status: 400 }
      );
    }

    // Format and validate slug
    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

    const reservedSlugs = ["admin", "api", "platform", "www", "app", "dashboard", "auth"];
    if (reservedSlugs.includes(cleanSlug)) {
      return NextResponse.json(
        { error: `The slug '${cleanSlug}' is reserved. Please choose another.` },
        { status: 400 }
      );
    }

    await connectToDb();

    return await withTenantContext(null, async () => {
      const existing = await Organization.findOne({ slug: cleanSlug });
      if (existing) {
        return NextResponse.json(
          { error: `Subdomain '${cleanSlug}' is already taken.` },
          { status: 409 }
        );
      }

      // Format domains array
      const domains = Array.isArray(allowedEmailDomains)
        ? allowedEmailDomains.map((d: string) => d.toLowerCase().trim()).filter(Boolean)
        : typeof allowedEmailDomains === "string"
        ? allowedEmailDomains
            .split(",")
            .map((d: string) => d.toLowerCase().trim())
            .filter(Boolean)
        : [];

      // Format departments array
      const depts = Array.isArray(departments)
        ? departments.map((d: string) => d.trim()).filter(Boolean)
        : typeof departments === "string"
        ? departments
            .split(",")
            .map((d: string) => d.trim())
            .filter(Boolean)
        : [];

      const newOrg = await Organization.create({
        name: name.trim(),
        slug: cleanSlug,
        allowedEmailDomains: domains,
        departments: depts.length > 0 ? depts : ["General", "Technical", "Cultural", "Sports"],
        contactEmail: contactEmail ? contactEmail.trim().toLowerCase() : undefined,
        plan: plan || "free",
        logo: logo || "",
        primaryColor: primaryColor || "#10b981",
        status: status || "active",
      });

      return NextResponse.json(
        { organization: newOrg, message: "Organization created successfully" },
        { status: 201 }
      );
    });
  } catch (error: any) {
    console.error("Error creating tenant:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
