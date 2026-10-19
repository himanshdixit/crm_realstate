"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiCheck, FiChevronDown, FiLoader, FiSearch, FiX } from "react-icons/fi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { lookupService } from "@/services/lookupService";
import { apiErrorMessage } from "@/services/apiClient";

function idsFromValue(value, multiple) {
  if (multiple) return (Array.isArray(value) ? value : []).map((item) => String(item?._id || item?.id || item)).filter(Boolean);
  const id = value?._id || value?.id || value;
  return id ? [String(id)] : [];
}

export function SearchableReference({ label, lookup, context, role, multiple = false, value, onChange, error, required = false, disabled = false }) {
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const selectedIds = useMemo(() => idsFromValue(value, multiple), [multiple, value]);
  const debouncedSearch = useDebouncedValue(search.trim(), 250);
  const options = useQuery({ queryKey: ["lookups", lookup, context, role || "", debouncedSearch, selectedIds.join(",")], queryFn: () => lookupService.list(lookup, { context, search: debouncedSearch, ids: selectedIds, role }), enabled: Boolean(lookup) && (open || selectedIds.length > 0), staleTime: 60_000, placeholderData: (previous) => previous });
  const selected = (options.data || []).filter((option) => selectedIds.includes(option.id));
  const available = (options.data || []).filter((option) => !selectedIds.includes(option.id));

  useEffect(() => { const close = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); }; document.addEventListener("pointerdown", close); return () => document.removeEventListener("pointerdown", close); }, []);
  const choose = (option) => { if (multiple) onChange([...selectedIds, option.id]); else { onChange(option.id); setOpen(false); } setSearch(""); };
  const remove = (id) => onChange(multiple ? selectedIds.filter((selectedId) => selectedId !== id) : "");

  return <div ref={rootRef} className="relative"><div className="mb-2 flex items-center justify-between"><label className="text-sm font-semibold">{label}{required && <span className="text-red-500"> *</span>}</label>{selectedIds.length > 0 && !multiple && <button type="button" onClick={() => { onChange(""); setOpen(true); }} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Change</button>}</div><div className={`surface min-h-11 rounded-xl border px-2 py-1.5 transition ${error ? "border-red-500" : "border-default focus-within:border-brand-400 focus-within:ring-4 focus-within:ring-brand-500/15"}`}>{selected.length > 0 && <div className="flex flex-wrap gap-1.5">{selected.map((option) => <span key={option.id} className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-800 dark:bg-brand-950 dark:text-brand-200"><span className="truncate">{option.label}</span><button type="button" onClick={() => remove(option.id)} aria-label={`Remove ${option.label}`} className="text-muted hover:text-red-600"><FiX /></button></span>)}</div>}{(multiple || !selectedIds.length) && <div className="flex h-8 items-center gap-2"><FiSearch className="shrink-0 text-muted" /><input value={search} disabled={disabled || !lookup} onFocus={() => setOpen(true)} onChange={(event) => { setSearch(event.target.value); setOpen(true); }} placeholder={lookup ? `Search ${label.toLowerCase()}...` : "Select record type first"} role="combobox" aria-expanded={open} className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted" />{options.isFetching ? <FiLoader className="animate-spin text-brand-600" /> : <FiChevronDown className="text-muted" />}</div>}</div>{error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}{open && lookup && <div className="surface absolute inset-x-0 top-[calc(100%+0.35rem)] z-40 max-h-64 overflow-y-auto rounded-xl border border-default p-1.5 shadow-xl">{options.isLoading ? <p className="px-3 py-5 text-center text-xs text-muted">Loading options...</p> : options.isError ? <p className="px-3 py-5 text-center text-xs text-red-600">{apiErrorMessage(options.error, "Options could not be loaded")}</p> : !available.length ? <p className="px-3 py-5 text-center text-xs text-muted">No matching options</p> : available.map((option) => <button key={option.id} type="button" onClick={() => choose(option)} className="focus-ring flex w-full items-center gap-3 rounded-lg px-3 py-2 text-start hover:bg-brand-50 dark:hover:bg-brand-950/50"><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{option.label}</span><span className="block truncate text-xs text-muted">{[option.description, option.status].filter(Boolean).join(" · ")}</span></span>{selectedIds.includes(option.id) && <FiCheck className="text-accent-500" />}</button>)}</div>}</div>;
}

export const searchableReferenceHelpers = { idsFromValue };
