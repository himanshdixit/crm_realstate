"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FiBell, FiCheck, FiLoader, FiTrash2 } from "react-icons/fi";
import { Button } from "@/components/ui/Button";
import { queryKeys } from "@/queries/queryKeys";
import { apiErrorMessage } from "@/services/apiClient";
import { notificationService } from "@/services/notificationService";

function safeInternalLink(link) {
  return typeof link === "string" && link.startsWith("/") && !link.startsWith("//") ? link : null;
}

export function NotificationCenter() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const rootRef = useRef(null);
  const [open, setOpen] = useState(false);
  const inbox = useQuery({ queryKey: queryKeys.notifications, queryFn: () => notificationService.inbox({ page: 1, limit: 15 }), staleTime: 15_000, refetchInterval: 30_000, refetchIntervalInBackground: false });
  const refresh = () => queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
  const markAll = useMutation({ mutationFn: notificationService.markAllRead, onSuccess: refresh, onError: (error) => toast.error(apiErrorMessage(error)) });
  const dismiss = useMutation({ mutationFn: notificationService.dismiss, onSuccess: refresh, onError: (error) => toast.error(apiErrorMessage(error)) });

  useEffect(() => {
    const pointer = (event) => { if (!rootRef.current?.contains(event.target)) setOpen(false); };
    const keyboard = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", pointer); window.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("pointerdown", pointer); window.removeEventListener("keydown", keyboard); };
  }, []);

  const openNotification = async (notification) => {
    if (!notification.readAt) { try { await notificationService.markRead(notification._id); refresh(); } catch (error) { toast.error(apiErrorMessage(error)); } }
    const link = safeInternalLink(notification.link); if (link) { setOpen(false); router.push(link); }
  };
  const unread = inbox.data?.unreadCount || 0;
  const items = inbox.data?.items || [];
  return <div ref={rootRef} className="relative"><Button variant="ghost" size="icon" onClick={() => setOpen((value) => !value)} aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"} aria-expanded={open} aria-controls="notification-center"><FiBell size={19} />{unread > 0 && <span className="absolute -end-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[9px] font-bold leading-4 text-white ring-2 ring-[var(--surface)]">{unread > 99 ? "99+" : unread}</span>}</Button>{open && <section id="notification-center" className="surface absolute end-0 top-[calc(100%+0.65rem)] z-50 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-default shadow-2xl shadow-slate-950/15" aria-label="Notification center"><header className="flex items-center justify-between gap-3 border-b border-default px-4 py-3"><div><h2 className="font-bold">Notifications</h2><p className="text-xs text-muted">{unread ? `${unread} unread` : "You’re all caught up"}</p></div>{unread > 0 && <Button variant="ghost" size="sm" onClick={() => markAll.mutate()} disabled={markAll.isPending}><FiCheck /> Mark all read</Button>}</header><div className="max-h-[28rem] overflow-y-auto p-2">{inbox.isLoading ? <div className="flex items-center justify-center gap-2 px-4 py-10 text-sm text-muted"><FiLoader className="animate-spin" /> Loading notifications...</div> : inbox.isError ? <div className="px-4 py-8 text-center"><p className="text-sm text-red-600">{apiErrorMessage(inbox.error, "Notifications could not be loaded")}</p><Button className="mt-3" size="sm" variant="secondary" onClick={() => inbox.refetch()}>Try again</Button></div> : !items.length ? <div className="px-4 py-10 text-center"><span className="mx-auto grid size-11 place-items-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-950 dark:text-brand-300"><FiBell /></span><p className="mt-3 text-sm font-semibold">No notifications yet</p><p className="mt-1 text-xs text-muted">Workflow and account updates will appear here.</p></div> : items.map((notification) => <div key={notification._id} className={`group flex gap-2 rounded-xl p-2 transition hover:bg-slate-50 dark:hover:bg-slate-800 ${notification.readAt ? "opacity-75" : "bg-brand-50/70 dark:bg-brand-950/30"}`}><button type="button" onClick={() => openNotification(notification)} className="focus-ring min-w-0 flex-1 rounded-lg p-1.5 text-start"><span className="flex items-start gap-2"><span className={`mt-1.5 size-2 shrink-0 rounded-full ${notification.readAt ? "bg-slate-300 dark:bg-slate-600" : "bg-accent-500"}`} /><span className="min-w-0"><span className="block truncate text-sm font-semibold">{notification.title}</span><span className="mt-0.5 block line-clamp-2 text-xs leading-5 text-muted">{notification.message}</span><span className="mt-1 block text-[10px] font-medium text-muted">{formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}</span></span></span></button><Button variant="deleteIcon" size="icon" className="size-8 self-center opacity-60 group-hover:opacity-100" onClick={() => dismiss.mutate(notification._id)} aria-label={`Dismiss ${notification.title}`}><FiTrash2 size={15} /></Button></div>)}</div></section>}</div>;
}

export const notificationCenterHelpers = { safeInternalLink };
