import { Brand } from "@/components/layout/Brand";
import { GuestGuard } from "@/components/auth/GuestGuard";

export default function AuthLayout({ children }) {
  return <GuestGuard>
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
      <section className="relative hidden overflow-hidden bg-[#0f172a] p-12 text-white lg:flex lg:flex-col">
        <div className="absolute -start-32 -top-32 size-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="absolute -bottom-40 end-0 size-[32rem] rounded-full bg-accent-500/20 blur-3xl" />
        <div className="relative"><Brand /></div>
        <div className="relative my-auto max-w-xl">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-brand-300">One workspace. Every relationship.</p>
          <h1 className="mt-5 text-5xl font-bold leading-[1.08] tracking-tight">Move every property opportunity forward.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-300">Bring inventory, prospects, visits, bookings, and revenue operations into a focused workspace built for modern real estate teams.</p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {["Role-aware", "Fast workflow", "Audit ready"].map((label) => <div key={label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-center text-sm font-semibold backdrop-blur">{label}</div>)}
          </div>
        </div>
        <p className="relative text-xs text-slate-400">Secure by design · Built for responsive teams</p>
      </section>
      <section className="surface flex min-h-screen items-center justify-center p-6 sm:p-10">{children}</section>
    </main>
  </GuestGuard>;
}
