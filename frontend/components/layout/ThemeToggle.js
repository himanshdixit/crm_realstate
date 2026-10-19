"use client";

import { FiMoon, FiSun } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { useTheme } from "@/providers/ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const dark = theme === "dark";
  return <Button variant="ghost" size="icon" onClick={() => setTheme(dark ? "light" : "dark")} aria-label={dark ? "Use light theme" : "Use dark theme"}>{dark ? <FiSun size={19} /> : <FiMoon size={19} />}</Button>;
}
