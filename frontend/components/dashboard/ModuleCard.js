import Link from "next/link";
import { FiArrowUpRight } from "react-icons/fi";
import { Card } from "@/components/ui/Card";

export function ModuleCard({ title, description, href, icon: Icon, accent }) {
  const content = <><div className="flex items-start justify-between gap-4"><span className={`grid size-11 place-items-center rounded-xl ${accent}`}><Icon size={20} /></span><FiArrowUpRight className="text-muted transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand-600 rtl:group-hover:-translate-x-0.5" /></div><h2 className="mt-5 font-bold">{title}</h2><p className="mt-1.5 text-sm leading-6 text-muted">{description}</p></>;
  return (
    <Card className="group overflow-hidden shadow-none transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-soft)]">
      {href ? <Link href={href} className="focus-ring block h-full rounded-2xl p-5">{content}</Link> : <div className="relative h-full p-5 opacity-75">{content}<span className="absolute end-4 top-4 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:bg-slate-800">Phase 6</span></div>}
    </Card>
  );
}
