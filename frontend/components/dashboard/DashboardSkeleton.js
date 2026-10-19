export function DashboardSkeleton() {
  return <div className="animate-pulse space-y-6" aria-label="Loading dashboard"><div className="h-20 rounded-2xl bg-slate-200 dark:bg-slate-800" /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="h-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />)}</div><div className="grid gap-6 xl:grid-cols-2"><div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" /><div className="h-96 rounded-2xl bg-slate-200 dark:bg-slate-800" /></div></div>;
}
