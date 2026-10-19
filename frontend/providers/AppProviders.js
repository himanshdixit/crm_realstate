"use client";

import { Toaster } from "react-hot-toast";
import { QueryProvider } from "./QueryProvider";
import { ReduxProvider } from "./ReduxProvider";
import { ThemeProvider } from "./ThemeProvider";
import { AuthProvider } from "./AuthProvider";
import { useHydrated } from "@/hooks/useHydrated";
import { PageLoader } from "@/components/common/PageLoader";

export function AppProviders({ children }) {
  const hydrated = useHydrated();
  if (!hydrated) return <PageLoader label="Preparing your workspace" />;
  return (
    <ReduxProvider>
      <QueryProvider>
        <AuthProvider><ThemeProvider>
          {children}<Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </ThemeProvider></AuthProvider>
      </QueryProvider>
    </ReduxProvider>
  );
}
