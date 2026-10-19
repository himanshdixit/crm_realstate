import { forwardRef } from "react";
import { classNames } from "@/utils/classNames";

export const Textarea = forwardRef(function Textarea({ label, error, hint, id, className, ...props }, ref) {
  const textareaId = id || props.name;
  return <label className="block" htmlFor={textareaId}>{label && <span className="mb-2 block text-sm font-semibold">{label}</span>}<textarea ref={ref} id={textareaId} aria-invalid={Boolean(error)} className={classNames("focus-ring surface min-h-28 w-full resize-y rounded-xl border px-3.5 py-3 text-sm placeholder:text-slate-400", error ? "border-rose-500" : "border-default", className)} {...props} />{(error || hint) && <span className={classNames("mt-1.5 block text-xs", error ? "text-rose-600" : "text-muted")}>{error || hint}</span>}</label>;
});
