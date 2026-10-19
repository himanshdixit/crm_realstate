import { forwardRef } from "react";
import { classNames } from "@/utils/classNames";

export const Checkbox = forwardRef(function Checkbox({ label, description, error, className, ...props }, ref) {
  return <label className={classNames("flex items-start gap-3", className)}><input ref={ref} type="checkbox" className="focus-ring mt-0.5 size-4 shrink-0 rounded border-default accent-brand-600" aria-invalid={Boolean(error)} {...props} /><span><span className="block text-sm font-semibold">{label}</span>{description && <span className="mt-0.5 block text-xs text-muted">{description}</span>}{error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}</span></label>;
});
