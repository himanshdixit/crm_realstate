import { Card, CardBody, CardHeader } from "@/components/ui/Card";

export function ChartPanel({ title, description, action, children }) {
  return <Card className="min-w-0 shadow-none"><CardHeader><div><h2 className="font-bold">{title}</h2>{description && <p className="mt-1 text-xs text-muted">{description}</p>}</div>{action}</CardHeader><CardBody>{children}</CardBody></Card>;
}
