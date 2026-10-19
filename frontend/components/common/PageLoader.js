export function PageLoader({ label = "Loading" }) {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-live="polite">
      <div className="text-center">
        <span className="mx-auto block size-9 animate-spin rounded-full border-4 border-brand-100 border-t-brand-600 motion-reduce:animate-none" />
        <p className="mt-3 text-sm font-medium text-muted">{label}</p>
      </div>
    </div>
  );
}
