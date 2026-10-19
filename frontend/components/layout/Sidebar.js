"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { navigation, utilityNavigation } from "@/config/navigation";
import { toggleSidebar } from "@/redux/slices/uiSlice";
import { classNames } from "@/utils/classNames";
import { Brand } from "./Brand";

function NavigationItem({ item, collapsed }) {
  const pathname = usePathname();
  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
  const Icon = item.icon;
  if (!item.available) {
    return <span title={collapsed ? `${item.label} — available in CRM modules phase` : undefined} aria-disabled="true" className={classNames("flex h-11 items-center rounded-xl text-sm font-semibold text-slate-400 opacity-65", collapsed ? "justify-center px-2" : "gap-3 px-3")}><Icon size={19} className="shrink-0" />{!collapsed && <><span>{item.label}</span><span className="ms-auto text-[9px] font-bold uppercase tracking-wider">Soon</span></>}</span>;
  }
  return (
    <Link href={item.href} title={collapsed ? item.label : undefined} aria-current={active ? "page" : undefined} className={classNames("focus-ring group flex h-11 items-center rounded-xl text-sm font-semibold transition", collapsed ? "justify-center px-2" : "gap-3 px-3", active ? "bg-brand-600 text-white shadow-md shadow-brand-600/20" : "text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-800")}>
      <Icon size={19} className="shrink-0" />{!collapsed && <span>{item.label}</span>}
    </Link>
  );
}

export function Sidebar() {
  const dispatch = useDispatch();
  const collapsed = useSelector((state) => state.ui.sidebarCollapsed);
  const direction = useSelector((state) => state.ui.direction);
  const ToggleIcon = direction === "rtl" ? (collapsed ? FiChevronLeft : FiChevronRight) : (collapsed ? FiChevronRight : FiChevronLeft);
  return (
    <aside className={classNames("surface fixed inset-y-0 start-0 z-40 hidden border-e border-default transition-[width] duration-200 lg:flex lg:flex-col", collapsed ? "w-20" : "w-64")}>
      <div className={classNames("flex h-20 items-center border-b border-default", collapsed ? "justify-center" : "px-5")}><Brand compact={collapsed} /></div>
      <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-3" aria-label="Primary navigation">
        {navigation.map((item) => <NavigationItem key={item.href} item={item} collapsed={collapsed} />)}
        <div className="my-3 border-t border-default" />
        {utilityNavigation.map((item) => <NavigationItem key={item.href} item={item} collapsed={collapsed} />)}
      </nav>
      <button onClick={() => dispatch(toggleSidebar())} className="focus-ring m-3 flex h-10 items-center justify-center rounded-xl border border-default text-muted hover:bg-slate-100 dark:hover:bg-slate-800" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}><ToggleIcon /></button>
    </aside>
  );
}
