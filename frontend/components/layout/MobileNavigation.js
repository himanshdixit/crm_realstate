"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { FiX } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { navigation, utilityNavigation } from "@/config/navigation";
import { setMobileNavigation } from "@/redux/slices/uiSlice";
import { classNames } from "@/utils/classNames";
import { Brand } from "./Brand";

export function MobileNavigation() {
  const dispatch = useDispatch();
  const pathname = usePathname();
  const open = useSelector((state) => state.ui.mobileNavigationOpen);
  if (!open) return null;
  const close = () => dispatch(setMobileNavigation(false));
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
      <button className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm" onClick={close} aria-label="Close navigation" />
      <aside className="surface relative flex h-full w-[min(86vw,20rem)] flex-col shadow-2xl">
        <div className="flex h-20 items-center justify-between border-b border-default px-5"><Brand /><Button variant="ghost" size="icon" onClick={close} aria-label="Close navigation"><FiX size={22} /></Button></div>
        <nav className="scrollbar-thin flex-1 space-y-1 overflow-y-auto p-4">
          {[...navigation, ...utilityNavigation].map((item) => { const Icon = item.icon; const active = pathname === item.href; return item.available ? <Link key={item.href} href={item.href} onClick={close} className={classNames("focus-ring flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold", active ? "bg-brand-600 text-white" : "text-muted hover:bg-slate-100 dark:hover:bg-slate-800")}><Icon size={19} />{item.label}</Link> : <span key={item.href} aria-disabled="true" className="flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold text-slate-400 opacity-65"><Icon size={19} />{item.label}<span className="ms-auto text-[9px] uppercase">Soon</span></span>; })}
        </nav>
      </aside>
    </div>
  );
}
