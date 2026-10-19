import Link from "next/link";
import { FiArrowLeft, FiMapPin } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="max-w-lg text-center">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300"><FiMapPin size={28} /></span>
        <p className="mt-6 text-sm font-bold uppercase tracking-[0.2em] text-brand-600">404</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">This address is off the map</h1>
        <p className="mt-4 text-muted">The page may have moved, or you may not have access to this part of the workspace.</p>
        <Button asChild className="mt-8"><Link href="/dashboard"><FiArrowLeft /> Back to dashboard</Link></Button>
      </section>
    </main>
  );
}
