"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { flexRender, useTable } from "@tanstack/react-table";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import { FiEdit2, FiPlus, FiSearch, FiTrash2 } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { useAuthorization } from "@/hooks/useAuthorization";
import { resourceService } from "@/services/resourceService";
import { apiErrorMessage } from "@/services/apiClient";
import { formatLabel } from "@/utils/formatLabel";
import { resourceSchema } from "@/utils/resourceSchema";
import { resourcePermission } from "@/config/resourcePermissions";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { WorkflowActions } from "./WorkflowActions";
import { SearchableReference } from "@/components/forms/SearchableReference";

function displayValue(value) { if (value === null || value === undefined || value === "") return "—"; if (typeof value === "object") return value.firstName ? `${value.firstName} ${value.lastName || ""}` : value.title || value.name || value.reference || value._id; if (/^\d{4}-\d{2}-\d{2}T/.test(String(value))) return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)); return String(value); }
function referenceId(value) { return value?._id || value?.id || value || ""; }
function fieldValue(field, value) {
  if (field.type === "datetime-local" && value) return new Date(value).toISOString().slice(0, 16);
  if (field.type === "json") return JSON.stringify(value ?? [], null, 2);
  if (field.type === "reference") return String(referenceId(value));
  if (field.type === "reference-multi") return (Array.isArray(value) ? value : []).map(referenceId).filter(Boolean).map(String);
  return value ?? "";
}

export function ResourcePage({ resource, config }) {
  const client = useQueryClient(); const authorization = useAuthorization();
  const [page, setPage] = useState(1); const [searchInput, setSearchInput] = useState(""); const [submittedSearch, setSubmittedSearch] = useState(null); const [editing, setEditing] = useState(null); const [open, setOpen] = useState(false);
  useEffect(() => { const value = new URLSearchParams(window.location.search).get("search") || ""; if (value) { setSearchInput(value); setSubmittedSearch(value); setPage(1); } }, [resource]);
  const debouncedSearch = useDebouncedValue(searchInput.trim());
  const search = submittedSearch === searchInput.trim() ? submittedSearch : debouncedSearch;
  const setSearch = setSubmittedSearch;
  const permission = resourcePermission(resource);
  const query = useQuery({ queryKey: ["resources", resource, page, search], queryFn: () => resourceService.list(resource, { page, limit: 15, search, sort: "-createdAt" }), placeholderData: (previous) => previous });
  const form = useForm({ resolver: zodResolver(resourceSchema(config.fields)) });
  const close = () => { setOpen(false); setEditing(null); form.reset({}); };
  const save = useMutation({ mutationFn: (values) => editing ? resourceService.update(resource, editing._id, values) : resourceService.create(resource, values), onSuccess: () => { toast.success(editing ? "Record updated" : "Record created"); client.invalidateQueries({ queryKey: ["resources", resource] }); close(); }, onError: (error) => toast.error(apiErrorMessage(error)) });
  const remove = useCallback(async (record) => { const result = await Swal.fire({ title: "Delete this record?", text: "It can be restored by an authorized administrator.", icon: "warning", showCancelButton: true, confirmButtonColor: "#dc2626", confirmButtonText: "Delete" }); if (!result.isConfirmed) return; try { await resourceService.remove(resource, record._id); toast.success("Record deleted"); client.invalidateQueries({ queryKey: ["resources", resource] }); } catch (error) { toast.error(apiErrorMessage(error)); } }, [client, resource]);
  const columns = useMemo(() => [...config.columns.map((key) => ({ accessorKey: key, header: formatLabel(key), cell: ({ getValue }) => <span className={key === "status" ? "rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold dark:bg-slate-800" : ""}>{displayValue(getValue())}</span> })), { id: "actions", header: "", cell: ({ row }) => <div className="flex justify-end gap-1"><WorkflowActions resource={resource} record={row.original} authorization={authorization} onComplete={() => client.invalidateQueries({ queryKey: ["resources", resource] })} />{authorization.can(`${permission}.update`) && <Button variant="editIcon" size="icon" onClick={() => { setEditing(row.original); form.reset(Object.fromEntries(config.fields.map((field) => [field.name, fieldValue(field, row.original[field.name])]))); setOpen(true); }} aria-label="Edit"><FiEdit2 /></Button>}{authorization.can(`${permission}.delete`) && <Button variant="deleteIcon" size="icon" onClick={() => remove(row.original)} aria-label="Delete"><FiTrash2 /></Button>}</div> }], [authorization, client, config.columns, config.fields, form, permission, remove, resource]);
  const table = useTable({ data: query.data?.items || [], columns, manualPagination: true });
  const renderField = (field) => {
    const error = form.formState.errors[field.name]?.message;
    if (field.type === "reference" || field.type === "reference-multi") {
      const lookup = field.lookup || field.lookupMap?.[form.watch(field.lookupBy)];
      return <Controller key={`${field.name}:${lookup || "none"}`} name={field.name} control={form.control} render={({ field: controlledField }) => <SearchableReference {...controlledField} label={field.label} lookup={lookup} context={resource} role={field.lookupRole} multiple={field.type === "reference-multi"} required={field.required} error={error} />} />;
    }
    if (field.type === "select") {
      const registration = form.register(field.name);
      return <Select key={field.name} label={field.label} options={field.options.map((value) => ({ value, label: formatLabel(value) }))} placeholder="Select" error={error} {...registration} onChange={(event) => { registration.onChange(event); config.fields.filter((item) => item.lookupBy === field.name).forEach((item) => form.setValue(item.name, item.type === "reference-multi" ? [] : "", { shouldValidate: false })); }} />;
    }
    if (field.type === "json") return <Textarea key={field.name} label={field.label} hint='Example: [{"description":"Booking fee","quantity":1,"unitPriceMinor":50000}]' error={error} {...form.register(field.name)} />;
    return <Input key={field.name} label={field.label} type={field.type} error={error} {...form.register(field.name)} />;
  };
  return <div className="space-y-6"><PageHeader eyebrow="CRM module" title={config.title} description={config.description} actions={authorization.can(`${permission}.create`) && <Button onClick={() => { setEditing(null); form.reset(Object.fromEntries(config.fields.map((field) => [field.name, field.type === "reference-multi" ? [] : ""]))); setOpen(true); }}><FiPlus /> Add record</Button>} /><Card className="shadow-none"><CardBody><form onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchInput.trim()); }} className="mb-5 flex gap-2"><div className="relative max-w-md flex-1"><FiSearch className="absolute start-3 top-3.5 text-muted" /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder={config.search || `Search ${config.title.toLowerCase()}`} className="focus-ring surface h-11 w-full rounded-xl border border-default ps-10 pe-3 text-sm" /></div><Button variant="secondary" type="submit">Search</Button></form>{query.isLoading ? <p className="py-12 text-center text-sm text-muted">Loading records…</p> : query.isError ? <EmptyState title="Unable to load records" description={apiErrorMessage(query.error)} action={<Button onClick={() => query.refetch()}>Try again</Button>} /> : !query.data.items.length ? <EmptyState title={`No ${config.title.toLowerCase()} found`} description="Create the first record or adjust your search." /> : <div className="overflow-x-auto"><table className="w-full min-w-[680px] text-start text-sm"><thead><tr className="border-b border-default text-xs uppercase tracking-wider text-muted">{table.getHeaderGroups()[0].headers.map((header) => <th key={header.id} className="px-3 py-3 text-start">{flexRender(header.column.columnDef.header, header.getContext())}</th>)}</tr></thead><tbody>{table.getRowModel().rows.map((row) => <tr key={row.id} className="border-b border-default last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">{row.getAllCells().map((cell) => <td key={cell.id} className="max-w-64 truncate px-3 py-3">{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>)}</tr>)}</tbody></table></div>}<div className="mt-5 flex items-center justify-between text-sm text-muted"><span>{query.data?.meta?.total || 0} records</span><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>Previous</Button><Button variant="secondary" size="sm" disabled={!query.data?.meta?.hasNextPage} onClick={() => setPage((value) => value + 1)}>Next</Button></div></div></CardBody></Card><Modal open={open} onClose={close} title={`${editing ? "Edit" : "Add"} ${config.title}`}><form onSubmit={form.handleSubmit((values) => save.mutate(values))} className="grid gap-4 sm:grid-cols-2">{config.fields.map(renderField)}<div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="secondary" onClick={close}>Cancel</Button><Button type="submit" disabled={save.isPending}>{save.isPending ? "Saving…" : "Save"}</Button></div></form></Modal></div>;
}
