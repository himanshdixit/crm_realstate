"use client";

import { memo, useMemo } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip } from "chart.js";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrencyMinor } from "@/utils/formatCurrency";
import { formatLabel } from "@/utils/formatLabel";

ChartJS.register(ArcElement, BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);
const palette = ["#6366f1", "#14b8a6", "#0f172a", "#f59e0b", "#ef4444", "#818cf8", "#64748b"];
const baseOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { usePointStyle: true, boxWidth: 8 } } } };

export const RevenueChart = memo(function RevenueChart({ rows, currency = "INR" }) {
  const chart = useMemo(() => ({
    data: { labels: rows.map(({ year, month }) => new Intl.DateTimeFormat("en", { month: "short", year: "2-digit" }).format(new Date(Date.UTC(year, month - 1, 1)))), datasets: [{ label: "Revenue", data: rows.map(({ amountMinor }) => amountMinor), borderColor: "#6366f1", backgroundColor: "rgba(99,102,241,.12)", fill: true, tension: 0.35, pointRadius: 3 }] },
    options: { ...baseOptions, scales: { y: { beginAtZero: true, ticks: { callback: (value) => formatCurrencyMinor(value, currency, "en-IN", { maximumFractionDigits: 0 }) } } }, plugins: { ...baseOptions.plugins, tooltip: { callbacks: { label: (context) => formatCurrencyMinor(context.raw, currency) } }, legend: { display: false } } },
  }), [currency, rows]);
  if (!rows.some((row) => row.amountMinor > 0)) return <EmptyState title="No revenue recorded" description="Paid transactions will appear here automatically." />;
  return <div className="h-72"><Line data={chart.data} options={chart.options} /></div>;
});

export const DistributionChart = memo(function DistributionChart({ rows = [], labelKey, valueKey = "count", type = "doughnut", emptyTitle }) {
  const data = useMemo(() => ({ labels: rows.map((row) => formatLabel(row[labelKey])), datasets: [{ data: rows.map((row) => row[valueKey]), backgroundColor: palette, borderWidth: 0, borderRadius: type === "bar" ? 6 : 0 }] }), [labelKey, rows, type, valueKey]);
  if (!rows.some((row) => row[valueKey] > 0)) return <EmptyState title={emptyTitle} />;
  return <div className="h-64">{type === "bar" ? <Bar data={data} options={{ ...baseOptions, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }, plugins: { ...baseOptions.plugins, legend: { display: false } } }} /> : <Doughnut data={data} options={{ ...baseOptions, cutout: "66%", plugins: { ...baseOptions.plugins, legend: { position: "bottom" } } }} />}</div>;
});
