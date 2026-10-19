"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "estateflow-theme";

export function ThemeProvider({ children }) {
  const [theme, updateTheme] = useState("system");

  const applyTheme = useCallback((value) => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", value === "dark" || (value === "system" && prefersDark));
  }, []);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem(STORAGE_KEY);
    if (!["light", "dark", "system"].includes(savedTheme)) return undefined;
    const timer = window.setTimeout(() => updateTheme(savedTheme), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyTheme(theme);
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = () => theme === "system" && applyTheme("system");
    query.addEventListener("change", listener);
    return () => query.removeEventListener("change", listener);
  }, [applyTheme, theme]);

  const setTheme = useCallback((nextTheme) => {
    if (!["light", "dark", "system"].includes(nextTheme)) return;
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    updateTheme(nextTheme);
    applyTheme(nextTheme);
  }, [applyTheme]);

  const value = useMemo(() => ({ theme, setTheme }), [setTheme, theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside ThemeProvider");
  return context;
}
