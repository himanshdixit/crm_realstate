"use client";

import { classNames } from "@/utils/classNames";

export function Switch({ checked, onChange, label, disabled = false }) {
  return <label className={classNames("inline-flex items-center gap-3", disabled && "opacity-60")}><button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={classNames("focus-ring relative h-6 w-11 rounded-full transition", checked ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-700")}><span className={classNames("absolute top-0.5 size-5 rounded-full bg-white shadow transition-[inset]", checked ? "end-0.5" : "start-0.5")} /></button>{label && <span className="text-sm font-semibold">{label}</span>}</label>;
}
