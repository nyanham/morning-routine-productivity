/**
 * Skeleton placeholder for the entries list while data loads.
 *
 * Renders five pulsing rows that mirror the real entry panels,
 * with a single `role="status"` + `aria-live` announcement.
 */
export default function EntriesListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">Loading entries…</span>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-xl bg-white/50 px-5 py-4 backdrop-blur-md"
          aria-hidden="true"
        >
          <div className="h-5 w-5 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
          <div className="h-6 w-16 rounded-full bg-slate-200" />
          <div className="h-5 w-5 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}
