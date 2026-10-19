import { AppShell } from "@/components/layout/AppShell";
import { AuthGuard } from "@/components/auth/AuthGuard";

export default function DashboardLayout({ children }) {
  return <AuthGuard><AppShell>{children}</AppShell></AuthGuard>;
}
