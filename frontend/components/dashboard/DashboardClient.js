"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { format, formatDistanceToNow } from "date-fns";
import { FiBell, FiBriefcase, FiCalendar, FiCheckCircle, FiDollarSign, FiHome, FiRefreshCw, FiTarget, FiUsers } from "react-icons/fi";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { useDashboardQuery } from "@/queries/useDashboardQuery";
import { formatCurrencyMinor } from "@/utils/formatCurrency";
import { formatLabel } from "@/utils/formatLabel";
import { ChartPanel } from "./ChartPanel";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { MetricCard } from "./MetricCard";
import { AdministrationPanel } from "./AdministrationPanel";

const RevenueChart = dynamic(() => import("./DashboardCharts").then((module) => module.RevenueChart), { ssr: false, loading: () => <div className="h-72 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> });
const DistributionChart = dynamic(() => import("./DashboardCharts").then((module) => module.DistributionChart), { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" /> });

function WorkList({ title, items, type }) {
  const Icon = type === "tasks" ? FiCheckCircle : FiCalendar;
  return <Card className="shadow-none"><CardHeader><div><h2 className="font-bold">{title}</h2><p className="mt-1 text-xs text-muted">{type === "tasks" ? "Due today" : "Next scheduled meetings"}</p></div><Icon className="text-brand-600" /></CardHeader><CardBody className="space-y-3">{items.length === 0 ? <EmptyState icon={Icon} title={type === "tasks" ? "Nothing due today" : "No upcoming appointments"} /> : items.map((item) => <div key={item._id} className="flex items-center gap-3 rounded-xl border border-default p-3"><span className="grid size-9 place-items-center rounded-lg bg-brand-50 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><Icon /></span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{item.title}</p><p className="mt-0.5 text-xs text-muted">{type === "tasks" ? `${format(new Date(item.dueAt), "p")} · ${formatLabel(item.priority)}` : `${format(new Date(item.startsAt), "PPp")}${item.attendeeName ? ` · ${item.attendeeName}` : ""}`}</p></div></div>)}</CardBody></Card>;
}

function TopAgents({ agents }) {
  return <Card className="shadow-none"><CardHeader><div><h2 className="font-bold">Top agents</h2><p className="mt-1 text-xs text-muted">Ranked by converted leads</p></div><FiUsers className="text-brand-600" /></CardHeader><CardBody className="space-y-4">{agents.length === 0 ? <EmptyState title="No agent performance yet" /> : agents.map((agent, index) => <div key={agent.userId} className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-lg bg-slate-100 text-xs font-bold dark:bg-slate-800">{index + 1}</span><span className="grid size-9 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">{agent.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{agent.name}</p><p className="text-xs text-muted">{agent.converted} converted of {agent.leads} leads</p></div><strong className="text-sm">{Math.round(agent.conversionRate)}%</strong></div>)}</CardBody></Card>;
}

function ActivityList({ activities }) {
  return <Card className="shadow-none"><CardHeader><div><h2 className="font-bold">Recent activity</h2><p className="mt-1 text-xs text-muted">Latest CRM events</p></div></CardHeader><CardBody className="space-y-4">{activities.length === 0 ? <EmptyState title="No activity recorded" /> : activities.map((activity) => <div key={activity._id} className="relative border-s border-default ps-5 before:absolute before:-start-1 before:top-1 before:size-2 before:rounded-full before:bg-brand-500"><p className="text-sm font-semibold">{activity.title}</p><p className="mt-0.5 line-clamp-2 text-xs text-muted">{activity.description || formatLabel(activity.type)}</p><p className="mt-1 text-[11px] text-muted">{formatDistanceToNow(new Date(activity.occurredAt), { addSuffix: true })}</p></div>)}</CardBody></Card>;
}

function TransactionList({ transactions, currency }) {
  return <Card className="shadow-none"><CardHeader><div><h2 className="font-bold">Recent transactions</h2><p className="mt-1 text-xs text-muted">Latest payment activity</p></div><FiDollarSign className="text-brand-600" /></CardHeader><CardBody className="space-y-3">{transactions.length === 0 ? <EmptyState title="No transactions recorded" /> : transactions.map((transaction) => <div key={transaction._id} className="flex items-center justify-between gap-3 rounded-xl border border-default p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold">{transaction.reference}</p><p className="text-xs text-muted">{formatLabel(transaction.status)} · {transaction.paidAt ? format(new Date(transaction.paidAt), "PP") : format(new Date(transaction.createdAt), "PP")}</p></div><strong className="text-sm">{formatCurrencyMinor(transaction.amountMinor, transaction.currency || currency)}</strong></div>)}</CardBody></Card>;
}

function NotificationList({ notifications }) {
  return <Card className="shadow-none"><CardHeader><div><h2 className="font-bold">Notifications</h2><p className="mt-1 text-xs text-muted">Account and workflow updates</p></div><FiBell className="text-brand-600" /></CardHeader><CardBody className="space-y-3">{notifications.length === 0 ? <EmptyState icon={FiBell} title="You’re all caught up" /> : notifications.map((notification) => <div key={notification._id} className="flex gap-3 rounded-xl border border-default p-3"><span className={`mt-1 size-2 shrink-0 rounded-full ${notification.readAt ? "bg-slate-300" : "bg-brand-500"}`} /><div><p className="text-sm font-semibold">{notification.title}</p><p className="mt-0.5 line-clamp-2 text-xs text-muted">{notification.message}</p></div></div>)}</CardBody></Card>;
}

export function DashboardClient() {
  const [months, setMonths] = useState(12);
  const { data, isLoading, isError, error, refetch, isFetching } = useDashboardQuery(months);
  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <Card><CardBody className="py-14 text-center"><h1 className="text-2xl font-bold">Dashboard unavailable</h1><p className="mx-auto mt-2 max-w-lg text-sm text-muted">{error?.response?.data?.message || "Live analytics could not be loaded."}</p><Button className="mt-6" onClick={() => refetch()}><FiRefreshCw /> Try again</Button></CardBody></Card>;
  const internal = data.audience === "internal";
  const { summary } = data;
  return <div className="space-y-7"><PageHeader eyebrow="Live workspace" title="Dashboard" description={`Updated ${formatDistanceToNow(new Date(data.generatedAt), { addSuffix: true })}`} actions={<div className="flex items-center gap-2"><select value={months} onChange={(event) => setMonths(Number(event.target.value))} className="focus-ring surface h-11 rounded-xl border border-default px-3 text-sm font-semibold" aria-label="Analytics period"><option value={6}>Last 6 months</option><option value={12}>Last 12 months</option></select><Button variant="secondary" size="icon" onClick={() => refetch()} disabled={isFetching} aria-label="Refresh dashboard"><FiRefreshCw className={isFetching ? "animate-spin" : ""} /></Button></div>} />
    <section className={`grid gap-4 sm:grid-cols-2 ${internal ? "xl:grid-cols-4" : "xl:grid-cols-2"}`} aria-label="Key metrics"><MetricCard label={internal ? "Properties" : "Available properties"} value={summary.properties.total.toLocaleString()} trend={summary.properties.trendPercent} context="vs previous month" icon={FiHome} tone="blue" />{internal && <MetricCard label="Leads" value={summary.leads.total.toLocaleString()} trend={summary.leads.trendPercent} context={`${summary.leads.conversionRate}% conversion`} icon={FiTarget} tone="violet" />}<MetricCard label={internal ? "Bookings" : "Your bookings"} value={summary.bookings.total.toLocaleString()} trend={summary.bookings.trendPercent} context="vs previous month" icon={FiBriefcase} tone="amber" />{internal && <MetricCard label="Revenue" value={formatCurrencyMinor(summary.revenue.totalMinor, summary.revenue.currency)} trend={summary.revenue.trendPercent} context={`${formatCurrencyMinor(summary.revenue.currentMonthMinor, summary.revenue.currency)} this month`} icon={FiDollarSign} tone="emerald" />}</section>
    {internal && <><div className="grid gap-6 xl:grid-cols-[1.55fr_1fr]"><ChartPanel title="Revenue performance" description="Paid revenue by month" action={<span className="text-xs font-semibold text-muted">{summary.revenue.currency}</span>}><RevenueChart rows={data.revenue} currency={summary.revenue.currency} /></ChartPanel><ChartPanel title="Property status" description="Current inventory distribution"><DistributionChart rows={data.propertyStatus} labelKey="status" emptyTitle="No property inventory" /></ChartPanel></div><div className="grid gap-6 xl:grid-cols-2"><ChartPanel title="Lead funnel" description="Prospects by pipeline stage"><DistributionChart rows={data.leadFunnel} labelKey="status" type="bar" emptyTitle="No leads in the pipeline" /></ChartPanel><ChartPanel title="Lead sources" description="Acquisition channel mix"><DistributionChart rows={data.leadSources} labelKey="source" emptyTitle="No lead sources recorded" /></ChartPanel></div></>}
    <div className="grid gap-6 xl:grid-cols-2"><WorkList title="Today’s tasks" items={data.today.tasks} type="tasks" /><WorkList title="Upcoming appointments" items={data.today.appointments} type="appointments" /></div>
    {internal && <div className="grid gap-6 xl:grid-cols-2"><TopAgents agents={data.topAgents} /><ActivityList activities={data.recentActivities} /></div>}
    <div className="grid gap-6 xl:grid-cols-2"><TransactionList transactions={data.recentTransactions} currency={summary.revenue.currency} /><NotificationList notifications={data.notifications} /></div>
    {data.administration && <AdministrationPanel administration={data.administration} />}
  </div>;
}
