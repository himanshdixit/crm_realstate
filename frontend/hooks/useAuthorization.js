"use client";

import { useSelector } from "react-redux";

export function useAuthorization() {
  const permissions = useSelector((state) => state.auth.permissions);
  const granted = new Set(permissions);
  return {
    permissions,
    can: (permission) => granted.has(permission),
    canAny: (...required) => required.some((permission) => granted.has(permission)),
    canAll: (...required) => required.every((permission) => granted.has(permission)),
  };
}
