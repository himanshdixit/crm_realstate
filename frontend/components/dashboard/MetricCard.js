import { FiArrowDownRight, FiArrowUpRight, FiMinus } from "react-icons/fi";
import { Card, CardBody } from "@/components/ui/Card";
import { classNames } from "@/utils/classNames";

export function MetricCard({ label, value, context, trend, icon: Icon, tone = "blue" }) {
  const colors = { blue: "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300", violet: "bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300", emerald: "bg-accent-100 text-accent-700 dark:bg-accent-950 dark:text-accent-300", amber: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" };
  const TrendIcon = trend > 0 ? FiArrowUpRight : trend < 0 ? FiArrowDownRight : FiMinus;
  return <Card className="shadow-none"><CardBody><div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-muted">{label}</p><p className="mt-2 text-3xl font-bold tracking-tight">{value}</p></div><span className={classNames("grid size-11 place-items-center rounded-xl", colors[tone])}><Icon size={20} /></span></div><div className="mt-4 flex items-center gap-2 text-xs"><span className={classNames("inline-flex items-center gap-1 font-bold", trend > 0 ? "text-accent-600" : trend < 0 ? "text-rose-600" : "text-muted")}><TrendIcon />{Math.abs(trend || 0)}%</span><span className="text-muted">{context}</span></div></CardBody></Card>;
}
