import { AsyncLocalStorage } from "async_hooks";
import mongoose, { Schema } from "mongoose";

// Storage for execution context holding the active tenantId
export const tenantContext = new AsyncLocalStorage<{ tenantId?: string; skipTenant?: boolean }>();

export function runWithTenant<T>(tenantId: string | undefined, fn: () => Promise<T>): Promise<T> {
  return tenantContext.run({ tenantId, skipTenant: !tenantId }, fn);
}

export function runWithoutTenantFilter<T>(fn: () => Promise<T>): Promise<T> {
  return tenantContext.run({ skipTenant: true }, fn);
}

export function getActiveTenantId(): string | undefined {
  return tenantContext.getStore()?.tenantId;
}

export function isTenantFilterSkipped(): boolean {
  return !!tenantContext.getStore()?.skipTenant;
}

export interface TenantPluginOptions {
  required?: boolean;
}

export function tenantPlugin(schema: Schema, options: TenantPluginOptions = { required: true }) {
  // Add tenantId field if not already present
  if (!schema.path("tenantId")) {
    schema.add({
      tenantId: {
        type: Schema.Types.ObjectId,
        ref: "Organization",
        required: options.required !== false,
        index: true,
      },
    });
  }

  // Pre-save hook to automatically inject tenantId if set in context
  schema.pre("save", function (next) {
    const store = tenantContext.getStore();
    if (!this.get("tenantId") && store?.tenantId && !store.skipTenant) {
      this.set("tenantId", store.tenantId);
    }
    next();
  });

  // Query middleware helper to auto-inject tenantId
  const autoFilterTenant = function (this: any, next: (err?: Error) => void) {
    const store = tenantContext.getStore();

    // If skipTenant is explicitly true on query or context, bypass
    if (this.getOptions()?.skipTenant || store?.skipTenant) {
      return next();
    }

    const tenantId = this.getOptions()?.tenantId || store?.tenantId;
    if (tenantId) {
      const currentFilter = this.getFilter() || {};
      if (!currentFilter.tenantId) {
        this.setQuery({ ...currentFilter, tenantId });
      }
    }
    next();
  };

  const queryMethods = [
    "find",
    "findOne",
    "findOneAndUpdate",
    "findOneAndDelete",
    "findOneAndReplace",
    "countDocuments",
    "estimatedDocumentCount",
    "updateOne",
    "updateMany",
    "deleteOne",
    "deleteMany",
  ];

  queryMethods.forEach((method) => {
    schema.pre(method as any, autoFilterTenant);
  });

  // Add query helper .byTenant(tenantId)
  schema.query.byTenant = function (tenantId: string | mongoose.Types.ObjectId) {
    return this.where({ tenantId });
  };

  // Add query helper .skipTenant()
  schema.query.skipTenant = function () {
    return this.setOptions({ skipTenant: true });
  };
}
