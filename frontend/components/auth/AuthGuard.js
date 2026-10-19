"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { PageLoader } from "@/components/common/PageLoader";

export function AuthGuard({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useSelector((state) => state.auth.status);
  useEffect(() => { if (status === "anonymous") router.replace(`/login?next=${encodeURIComponent(pathname)}`); }, [pathname, router, status]);
  if (status !== "authenticated") return <PageLoader label="Verifying your session" />;
  return children;
}
