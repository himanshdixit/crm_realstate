"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { PageLoader } from "@/components/common/PageLoader";
import { useHydrated } from "@/hooks/useHydrated";

export function GuestGuard({ children }) {
  const router = useRouter();
  const hydrated = useHydrated();
  const status = useSelector((state) => state.auth.status);
  useEffect(() => { if (status === "authenticated") router.replace("/dashboard"); }, [router, status]);
  if (!hydrated || ["idle", "checking", "authenticated"].includes(status)) return <PageLoader label="Checking your session" />;
  return children;
}
