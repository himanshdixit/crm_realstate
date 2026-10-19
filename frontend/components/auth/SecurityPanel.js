"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { FiMonitor, FiShield, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { authService } from "@/services/authService";
import { apiErrorMessage } from "@/services/apiClient";
import { changePasswordSchema } from "@/validations/authSchemas";

export function SecurityPanel() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { register, reset, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(changePasswordSchema), defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });
  const load = () => authService.sessions().then(setSessions).catch((error) => toast.error(apiErrorMessage(error))).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  const changePassword = handleSubmit(async ({ currentPassword, newPassword }) => { try { const result = await authService.changePassword({ currentPassword, newPassword }); toast.success(result.message); reset(); } catch (error) { toast.error(apiErrorMessage(error)); } });
  const revoke = async (id) => { try { await authService.revokeSession(id); setSessions((items) => items.filter((item) => item.id !== id)); toast.success("Session revoked"); } catch (error) { toast.error(apiErrorMessage(error)); } };
  return <div className="grid gap-6 xl:grid-cols-2"><Card><CardHeader><div><h2 className="font-bold">Change password</h2><p className="mt-1 text-sm text-muted">Other devices are signed out after this change.</p></div><FiShield className="text-brand-600" /></CardHeader><CardBody><form onSubmit={changePassword} className="space-y-4"><Input label="Current password" type="password" error={errors.currentPassword?.message} {...register("currentPassword")} /><Input label="New password" type="password" error={errors.newPassword?.message} {...register("newPassword")} /><Input label="Confirm new password" type="password" error={errors.confirmPassword?.message} {...register("confirmPassword")} /><Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Updating…" : "Update password"}</Button></form></CardBody></Card><Card><CardHeader><div><h2 className="font-bold">Active sessions</h2><p className="mt-1 text-sm text-muted">Review devices with access to your account.</p></div><FiMonitor className="text-brand-600" /></CardHeader><CardBody className="space-y-3">{loading ? <p className="text-sm text-muted">Loading sessions…</p> : sessions.length === 0 ? <EmptyState title="No active sessions" /> : sessions.map((session) => <div key={session.id} className="flex items-center gap-3 rounded-xl border border-default p-3"><span className="grid size-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800"><FiMonitor /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{session.userAgent || "Unknown browser"} {session.current && <span className="text-brand-600">(current)</span>}</p><p className="text-xs text-muted">Last used {formatDistanceToNow(new Date(session.lastUsedAt), { addSuffix: true })} · {session.ipAddress || "Unknown IP"}</p></div><Button variant="deleteIcon" size="icon" onClick={() => revoke(session.id)} aria-label="Revoke session"><FiTrash2 /></Button></div>)}</CardBody></Card></div>;
}
