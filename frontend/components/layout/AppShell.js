"use client";

import { useEffect } from "react";
import { useSelector } from "react-redux";
import { Header } from "./Header";
import { MobileNavigation } from "./MobileNavigation";
import { Sidebar } from "./Sidebar";

export function AppShell({ children }) {
  const { sidebarCollapsed, direction } = useSelector((state) => state.ui);
  useEffect(() => { document.documentElement.dir = direction; }, [direction]);
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Header />
      <MobileNavigation />
      <main className={`min-h-screen pt-20 transition-[padding] ${sidebarCollapsed ? "lg:ps-20" : "lg:ps-64"}`}>
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
