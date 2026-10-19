import { classNames } from "@/utils/classNames";

const variants = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  info: "bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300",
  success: "bg-accent-100 text-accent-800 dark:bg-accent-950 dark:text-accent-300",
  warning: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  danger: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300",
};

export function Badge({ variant = "neutral", className, children }) {
  return <span className={classNames("inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold", variants[variant], className)}>{children}</span>;
}
