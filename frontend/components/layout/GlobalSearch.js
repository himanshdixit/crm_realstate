"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiArrowUpRight, FiLoader, FiSearch, FiX } from "react-icons/fi";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { apiErrorMessage } from "@/services/apiClient";
import { searchService } from "@/services/searchService";

export function GlobalSearch() {
  const router = useRouter();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const search = useQuery({ queryKey: ["global-search", debouncedQuery], queryFn: () => searchService.global(debouncedQuery), enabled: debouncedQuery.length >= 2, staleTime: 30_000, retry: 1 });

  useEffect(() => {
    const handlePointer = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const handleKey = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); inputRef.current?.focus(); setOpen(true); }
      if (event.key === "Escape") { setOpen(false); inputRef.current?.blur(); }
    };
    document.addEventListener("pointerdown", handlePointer);
    window.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("pointerdown", handlePointer); window.removeEventListener("keydown", handleKey); };
  }, []);

  const choose = (href) => { setOpen(false); inputRef.current?.blur(); router.push(href); };
  const showPanel = open && query.trim().length >= 2;
  return <div ref={rootRef} className="relative ms-2 min-w-0 flex-1 sm:max-w-md"><label className="focus-within:ring-brand-500/30 flex h-11 items-center gap-3 rounded-xl border border-transparent bg-slate-100 px-3 text-sm transition focus-within:border-brand-400 focus-within:bg-white focus-within:ring-4 dark:bg-slate-800 dark:focus-within:bg-slate-900"><FiSearch className="shrink-0 text-muted" size={18} /><input ref={inputRef} value={query} onChange={(event) => { setQuery(event.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder="Search properties, leads, customers..." aria-label="Global search" aria-expanded={showPanel} aria-controls="global-search-results" className="min-w-0 flex-1 bg-transparent text-[var(--foreground)] outline-none placeholder:text-muted" />{search.isFetching && <FiLoader className="shrink-0 animate-spin text-brand-600" />}{query && !search.isFetching ? <button type="button" onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="rounded p-1 text-muted hover:text-[var(--foreground)]" aria-label="Clear search"><FiX /></button> : <kbd className="hidden rounded-md border border-default bg-white px-2 py-0.5 text-[10px] font-bold uppercase dark:bg-slate-900 sm:inline">Ctrl K</kbd>}</label>{showPanel && <div id="global-search-results" className="surface absolute inset-x-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,32rem)] overflow-y-auto rounded-2xl border border-default p-2 shadow-2xl shadow-slate-950/15" role="listbox">{debouncedQuery !== query.trim() || search.isLoading ? <p className="px-4 py-6 text-center text-sm text-muted">Searching...</p> : search.isError ? <p className="px-4 py-6 text-center text-sm text-red-600">{apiErrorMessage(search.error, "Search could not be completed")}</p> : !search.data?.total ? <div className="px-4 py-7 text-center"><p className="font-semibold">No matching records</p><p className="mt-1 text-xs text-muted">Try a name, reference, email, phone, city, or keyword.</p></div> : search.data.groups.map((group) => <section key={group.resource} className="mb-2 last:mb-0"><p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{group.label}</p>{group.items.map((item) => <button key={`${group.resource}-${item.id}`} type="button" role="option" onClick={() => choose(item.href)} className="focus-ring flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-start hover:bg-brand-50 dark:hover:bg-brand-950/60"><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{item.title}</span><span className="block truncate text-xs text-muted">{[item.subtitle, item.status].filter(Boolean).join(" · ") || group.label}</span></span><FiArrowUpRight className="shrink-0 text-brand-600" /></button>)}</section>)}</div>}</div>;
}
