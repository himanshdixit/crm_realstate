import { forwardRef } from "react";
import { classNames } from "@/utils/classNames";

export const Input = forwardRef(function Input({ label, error, hint, id, className, containerClassName, ...props }, ref) {
  const inputId = id || props.name;
  const messageId = `${inputId}-message`;
  return (
    <label className={classNames("block", containerClassName)} htmlFor={inputId}>
      {label && <span className="mb-2 block text-sm font-semibold">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error || hint ? messageId : undefined}
        className={classNames("focus-ring surface h-11 w-full rounded-xl border px-3.5 text-sm transition placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60", error ? "border-rose-500" : "border-default hover:border-slate-300 dark:hover:border-slate-600", className)}
        {...props}
      />
      {(error || hint) && <span id={messageId} className={classNames("mt-1.5 block text-xs", error ? "text-rose-600" : "text-muted")}>{error || hint}</span>}
    </label>
  );
});
