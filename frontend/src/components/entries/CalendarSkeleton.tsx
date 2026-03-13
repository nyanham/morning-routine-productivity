/**
 * Skeleton placeholder for the entries page while data loads.
 *
 * Mirrors the real calendar's split layout: 3-col calendar grid
 * on the left + 2-col detail panel placeholder on the right.
 */
export default function CalendarSkeleton() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5"
    >
      <span className="sr-only">Loading calendar…</span>

      {/* Calendar grid — 3 columns on lg */}
      <div className="lg:col-span-3" aria-hidden="true">
        {/* Month nav skeleton */}
        <div className="mb-4 flex items-center gap-1">
          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
          <div className="h-6 w-36 animate-pulse rounded bg-slate-200" />
          <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
          <div className="ml-1 h-6 w-12 animate-pulse rounded-lg bg-slate-200" />
        </div>

        {/* Weekday header skeleton */}
        <div className="grid grid-cols-7 gap-1">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="flex justify-center py-2">
              <div className="h-3 w-6 animate-pulse rounded bg-slate-200" />
            </div>
          ))}
        </div>

        {/* Day cells skeleton (5 rows × 7 cols) */}
        <div className="space-y-1">
          {[...Array(5)].map((_, row) => (
            <div key={row} className="grid grid-cols-7 gap-1">
              {[...Array(7)].map((_, col) => (
                <div key={col} className="aspect-square animate-pulse rounded-lg bg-slate-100/60" />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Detail panel placeholder — 2 columns on lg */}
      <div className="min-h-[24rem] lg:col-span-2" aria-hidden="true">
        <div className="flex h-full flex-col items-center justify-center rounded-2xl bg-slate-50/40 px-6 py-16">
          <div className="mb-4 h-12 w-12 animate-pulse rounded-full bg-slate-200" />
          <div className="mb-2 h-5 w-40 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-56 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
    </div>
  );
}
