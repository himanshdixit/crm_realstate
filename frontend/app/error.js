"use client";

import { FiRefreshCw } from "react-icons/fi";
import { Button } from "@/components/ui/Button";

export default function RootError({ reset }) {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="max-w-lg text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-rose-600">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-bold">We couldn’t load this workspace</h1>
        <p className="mt-3 text-muted">Try the request again. If the issue continues, share the request time with your administrator.</p>
        <Button className="mt-7" onClick={reset}><FiRefreshCw /> Try again</Button>
      </section>
    </main>
  );
}
