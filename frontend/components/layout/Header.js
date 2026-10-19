"use client";

import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { FiMenu } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { setMobileNavigation } from "@/redux/slices/uiSlice";
import { ThemeToggle } from "./ThemeToggle";
import { authService } from "@/services/authService";
import { sessionCleared } from "@/redux/slices/authSlice";
import { GlobalSearch } from "./GlobalSearch";
import { NotificationCenter } from "./NotificationCenter";

export function Header() {
  const dispatch = useDispatch();
  const router = useRouter();
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);
  const user = useSelector((state) => state.auth.user);
  const initials = `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}` || "U";
  const logout = async () => { try { await authService.logout(); } finally { dispatch(sessionCleared()); router.replace("/login"); } };
  return (
    <header className={`surface fixed inset-x-0 top-0 z-30 flex h-20 items-center border-b border-default px-4 transition-[padding] sm:px-6 lg:pe-8 ${collapsed ? "lg:ps-24" : "lg:ps-68"}`}>
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => dispatch(setMobileNavigation(true))} aria-label="Open navigation"><FiMenu size={21} /></Button>
      <GlobalSearch />
      <div className="ms-auto flex items-center gap-1 sm:gap-2">
        <ThemeToggle />
        <NotificationCenter />
        <button onClick={logout} className="focus-ring ms-1 flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800" title="Sign out"><span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-bold text-white">{initials}</span><span className="hidden text-start xl:block"><strong className="block text-sm leading-tight">{user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`}</strong><span className="text-xs text-muted">Sign out</span></span></button>
      </div>
    </header>
  );
}
