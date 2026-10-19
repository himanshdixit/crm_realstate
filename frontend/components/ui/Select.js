import { forwardRef } from "react";
import { classNames } from "@/utils/classNames";

export const Select = forwardRef(function Select({ label, error, options = [], placeholder, id, className, ...props }, ref) {
  const selectId = id || props.name;
  return (
    <label className="block" htmlFor={selectId}>
      {label && <span className="mb-2 block text-sm font-semibold">{label}</span>}
      <select ref={ref} id={selectId} aria-invalid={Boolean(error)} className={classNames("focus-ring surface h-11 w-full rounded-xl border px-3.5 text-sm", error ? "border-rose-500" : "border-default", className)} {...props}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value, label: optionLabel }) => <option key={value} value={value}>{optionLabel}</option>)}
      </select>
      {error && <span className="mt-1.5 block text-xs text-rose-600">{error}</span>}
    </label>
  );
});
