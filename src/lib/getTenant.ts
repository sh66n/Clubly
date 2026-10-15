import { headers } from "next/headers";
import { connectToDb } from "./connectToDb";
import { Organization, IOrganization } from "@/models/organization.model";
import { runWithoutTenantFilter, runWithTenant } from "./tenantPlugin";
import { auth } from "@/auth";

export interface ResolvedTenant {
  tenantId?: string;
  tenantSlug?: string;
  organization?: IOrganization | null;
  isPlatformAdmin?: boolean;
}

/**
 * Resolves the active tenant from either:
 * 1. Request headers (x-tenant-id, x-tenant-slug)
 * 2. Authenticated session user.tenantId
 * 3. Default fallback to PVPPCOE if on root domain/legacy
 */
export async function getTenantFromHeaders(): Promise<ResolvedTenant> {
  const headerList = await headers();
  let tenantId = headerList.get("x-tenant-id") || undefined;
  const tenantSlug = headerList.get("x-tenant-slug") || undefined;
  const isPlatformAdmin = headerList.get("x-is-platform-admin") === "true";

  let organization: IOrganization | null = null;

  try {
    await connectToDb();

    if (tenantSlug) {
      organization = await runWithoutTenantFilter(() =>
        Organization.findOne({ slug: tenantSlug })
      );
      if (organization) {
        tenantId = organization._id.toString();
      }
    }

    if (!tenantId) {
      // Check user session
      const session = await auth();
      if (session?.user?.tenantId) {
        tenantId = session.user.tenantId;
        if (!organization) {
          organization = await runWithoutTenantFilter(() =>
            Organization.findById(tenantId)
          );
        }
      }
    }

    // Default fallback to PVPPCOE
    if (!tenantId && !isPlatformAdmin) {
      const defaultOrg = await runWithoutTenantFilter(() =>
        Organization.findOne({ slug: "pvppcoe" })
      );
      if (defaultOrg) {
        organization = defaultOrg;
        tenantId = defaultOrg._id.toString();
      }
    }
  } catch (e) {
    console.error("Failed to resolve tenant:", e);
  }

  return { tenantId, tenantSlug: organization?.slug || tenantSlug, organization, isPlatformAdmin };
}

/**
 * Helper to execute a service or handler with tenant context set in AsyncLocalStorage
 */
export async function withTenantContext<T>(
  fn: (tenant: ResolvedTenant) => Promise<T>
): Promise<T> {
  const resolved = await getTenantFromHeaders();
  return runWithTenant(resolved.tenantId, () => fn(resolved));
}
