"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { reportService } from "@/services/reportService";
import { apiErrorMessage } from "@/services/apiClient";

const reportResources = ["properties", "leads", "customers", "bookings", "payments", "invoices", "visits", "tasks"];

export default function ReportsPage() {
  const [running, setRunning] = useState("");
  async function run(resource, format) {
    const key = `${resource}-${format}`;
    setRunning(key);
    try { await reportService.export(resource, format); toast.success("Report downloaded"); }
    catch (error) { toast.error(apiErrorMessage(error, "Report export failed")); }
    finally { setRunning(""); }
  }
  return <div className="space-y-6">
    <PageHeader eyebrow="Analytics" title="Reports & exports" description="Generate organization-scoped operational reports as formatted Excel workbooks or print-ready PDF documents." />
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {reportResources.map((resource) => <Card key={resource} className="p-5">
        <h2 className="text-lg font-semibold capitalize">{resource}</h2>
        <p className="mt-1 text-sm text-muted">Export up to 5,000 current records permitted for your role.</p>
        <div className="mt-5 flex gap-2">
          <Button onClick={() => run(resource, "excel")} disabled={Boolean(running)}>{running === `${resource}-excel` ? "Preparing…" : "Excel"}</Button>
          <Button variant="secondary" onClick={() => run(resource, "pdf")} disabled={Boolean(running)}>{running === `${resource}-pdf` ? "Preparing…" : "PDF"}</Button>
        </div>
      </Card>)}
    </div>
  </div>;
}
