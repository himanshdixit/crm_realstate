"use client";

export default function GlobalError({ reset }) {
  return <html><body><main className="grid min-h-screen place-items-center bg-slate-950 px-6 text-white"><section className="max-w-md text-center"><p className="text-sm font-bold uppercase tracking-widest text-rose-400">Critical error</p><h1 className="mt-3 text-3xl font-bold">The application could not recover</h1><p className="mt-3 text-slate-300">Reload the application. If the problem continues, contact your administrator.</p><button onClick={reset} className="mt-7 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950">Reload application</button></section></main></body></html>;
}
