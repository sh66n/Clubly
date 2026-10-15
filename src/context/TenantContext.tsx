"use client";

import React, { createContext, useContext } from "react";

export interface TenantContextValue {
  tenantId?: string;
  slug?: string;
  name?: string;
  logo?: string;
  allowedEmailDomains?: string[];
  departments?: string[];
  isPlatformAdminPortal?: boolean;
  isRootDomain?: boolean;
}

const TenantContext = createContext<TenantContextValue>({});

export function TenantProvider({
  children,
  value,
}: {
  children: React.ReactNode;
  value: TenantContextValue;
}) {
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
