"use client";

import { useAuthorization } from "@/hooks/useAuthorization";

export function PermissionGuard({ permission, any = [], fallback = null, children }) {
  const authorization = useAuthorization();
  const allowed = permission ? authorization.can(permission) : authorization.canAny(...any);
  return allowed ? children : fallback;
}
