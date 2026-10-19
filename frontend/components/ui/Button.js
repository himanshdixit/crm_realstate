"use client";

import { cloneElement, isValidElement } from "react";
import { classNames } from "@/utils/classNames";

const variants = {
  primary: "bg-brand-600 text-white shadow-sm hover:bg-brand-700 disabled:bg-brand-300",
  secondary: "surface border border-default text-[var(--foreground)] hover:bg-slate-50 dark:hover:bg-slate-800",
  ghost: "text-[var(--muted)] hover:bg-slate-100 hover:text-[var(--foreground)] dark:hover:bg-slate-800",
  danger: "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
  editIcon: "text-blue-600 hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-950/60 dark:hover:text-blue-300",
  deleteIcon: "text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/60 dark:hover:text-red-300",
};

const sizes = {
  sm: "h-9 gap-2 rounded-lg px-3 text-sm",
  md: "h-11 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2.5 rounded-xl px-5 text-base",
  icon: "size-10 rounded-xl",
};

export function Button({ asChild = false, variant = "primary", size = "md", className, children, ...props }) {
  const styles = classNames("focus-ring inline-flex shrink-0 items-center justify-center font-semibold transition disabled:cursor-not-allowed disabled:opacity-60", variants[variant], sizes[size], className);
  if (asChild && isValidElement(children)) {
    return cloneElement(children, { ...props, className: classNames(styles, children.props.className) });
  }
  return <button className={styles} {...props}>{children}</button>;
}
