/**
 * Skeleton placeholder for the calendar grid while data loads.
 *
 * Renders a 7-column grid of pulsing cells that mirror the real
 * calendar layout (header bar + 5 rows of day cells).
 */
export default function CalendarSkeleton() {
  return (
    <div role="status" aria-live="polite">
      <span className="sr-only">Loading calendar…</span>

      {/* Month nav skeleton */}
      <div className="mb-4 flex items-center justify-between" aria-hidden="true">
        <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-9 w-9 animate-pulse rounded-lg bg-slate-200" />
      </div>

      {/* Weekday header skeleton */}
      <div className="grid grid-cols-7 gap-1" aria-hidden="true">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex justify-center py-2">
            <div className="h-3 w-8 animate-pulse rounded bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Day cells skeleton (5 rows × 7 cols = 35 cells) */}
      <div className="grid grid-cols-7 gap-1" aria-hidden="true">
        {[...Array(35)].map((_, i) => (
          <div key={i} className="aspect-square animate-pulse rounded-lg bg-slate-100/60" />
        ))}
      </div>
    </div>
  );
}
