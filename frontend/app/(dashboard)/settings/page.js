"use client";

import { useDispatch, useSelector } from "react-redux";
import { FiCheck, FiMoon, FiMonitor, FiSun } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { useTheme } from "@/providers/ThemeProvider";
import { setDirection } from "@/redux/slices/uiSlice";
import { classNames } from "@/utils/classNames";

const themes = [{ value: "light", label: "Light", icon: FiSun }, { value: "dark", label: "Dark", icon: FiMoon }, { value: "system", label: "System", icon: FiMonitor }];

export default function SettingsPage() {
  const dispatch = useDispatch();
  const direction = useSelector((state) => state.ui.direction);
  const { theme, setTheme } = useTheme();
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Preferences" title="Workspace settings" description="Personalize how the CRM looks and reads on this device." />
      <Card><CardHeader><div><h2 className="font-bold">Appearance</h2><p className="mt-1 text-sm text-muted">Select a color mode for the interface.</p></div></CardHeader><CardBody><div className="grid gap-3 sm:grid-cols-3">{themes.map(({ value, label, icon: Icon }) => <button key={value} onClick={() => setTheme(value)} className={classNames("focus-ring flex items-center gap-3 rounded-xl border p-4 text-sm font-semibold", theme === value ? "border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200" : "border-default hover:bg-slate-50 dark:hover:bg-slate-800")}><Icon size={19} />{label}{theme === value && <FiCheck className="ms-auto text-brand-600" />}</button>)}</div></CardBody></Card>
      <Card><CardHeader><div><h2 className="font-bold">Reading direction</h2><p className="mt-1 text-sm text-muted">Use left-to-right or right-to-left layout direction.</p></div></CardHeader><CardBody><div className="flex flex-wrap gap-3">{[{ value: "ltr", label: "Left to right" }, { value: "rtl", label: "Right to left" }].map(({ value, label }) => <button key={value} onClick={() => dispatch(setDirection(value))} className={classNames("focus-ring rounded-xl border px-5 py-3 text-sm font-semibold", direction === value ? "border-brand-500 bg-brand-50 text-brand-800 dark:bg-brand-950 dark:text-brand-200" : "border-default")}>{label}</button>)}</div></CardBody></Card>
    </div>
  );
}
