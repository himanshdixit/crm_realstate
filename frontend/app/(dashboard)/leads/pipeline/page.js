"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { resourceService } from "@/services/resourceService";

const stages = ["new", "contacted", "qualified", "proposal", "negotiation", "converted", "lost"];

export default function LeadPipelinePage() {
  const { data, isPending, error } = useQuery({ queryKey: ["lead-pipeline"], queryFn: resourceService.leadPipeline });
  return <div className="space-y-6">
    <PageHeader eyebrow="Sales CRM" title="Lead pipeline" description="A score-prioritized Kanban view of every active sales stage." actions={<Button asChild variant="secondary"><Link href="/leads">Table view</Link></Button>} />
    {error && <Card className="p-5 text-sm text-rose-600">{error.response?.data?.message || "The pipeline could not be loaded."}</Card>}
    <div className="flex gap-4 overflow-x-auto pb-4">
      {stages.map((stage) => <section key={stage} className="w-72 shrink-0 rounded-2xl bg-slate-100/70 p-3 dark:bg-slate-900/60">
        <header className="mb-3 flex items-center justify-between px-1"><h2 className="font-semibold capitalize">{stage}</h2><span className="rounded-full bg-white px-2 py-0.5 text-xs dark:bg-slate-800">{data?.stages?.[stage]?.length || 0}</span></header>
        <div className="space-y-3">{isPending ? <Card className="h-24 animate-pulse" /> : data?.stages?.[stage]?.map((lead) => <Card key={lead._id} className="p-4">
          <h3 className="font-semibold">{lead.name}</h3><p className="mt-1 truncate text-sm text-muted">{lead.phone || lead.email || "No contact details"}</p><div className="mt-3 flex justify-between text-xs text-muted"><span>{lead.source}</span><span>Score {lead.score || 0}</span></div>
        </Card>)}</div>
      </section>)}
    </div>
  </div>;
}
