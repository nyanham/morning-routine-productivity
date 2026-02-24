/**
 * Skeleton loading primitives for dashboard components.
 *
 * These provide a pulsing placeholder UI so users know content is being
 * fetched, instead of showing template/demo data.  All skeletons use the
 * Tailwind `animate-pulse` utility for a consistent, gentle loading feel.
 *
 * Accessibility: Only `DashboardSkeleton` carries `role="status"` and
 * `aria-live="polite"` so assistive technologies receive a single
 * "Loading dashboard…" announcement.  The individual skeleton pieces
 * are marked `aria-hidden` to avoid noisy per-card announcements.
 *
 * Components:
 * - `StatsCardSkeleton`  — replaces a single StatsCard while loading
 * - `ChartSkeleton`      — replaces a chart card (line, bar, or pie)
 * - `TableSkeleton`      — replaces the Recent Entries table
 * - `DashboardSkeleton`  — composes all of the above into the full layout
 */

// ——————————————————————————————————————————
// StatsCard skeleton
// ——————————————————————————————————————————

/** A pulsing placeholder that mirrors the StatsCard layout. */
export function StatsCardSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          {/* Title */}
          <div className="h-4 w-24 rounded bg-slate-200" />
          {/* Value */}
          <div className="h-8 w-16 rounded bg-slate-200" />
          {/* Subtitle */}
          <div className="h-3 w-20 rounded bg-slate-200" />
        </div>
        {/* Icon placeholder */}
        <div className="h-12 w-12 rounded-lg bg-slate-200" />
      </div>
      {/* Trend row */}
      <div className="mt-4 flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-slate-200" />
        <div className="h-3 w-20 rounded bg-slate-200" />
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Chart skeleton
// ——————————————————————————————————————————

/** A pulsing placeholder that mirrors a chart card (title bar + 20rem (h-80) chart area). */
export function ChartSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      {/* Title bar */}
      <div className="mb-4 h-5 w-48 rounded bg-slate-200" />
      {/* Chart area — matches the h-80 used by real charts */}
      <div className="flex h-80 items-end justify-between gap-2 px-4 pb-4">
        {/* Simulated bar/line shapes */}
        {[40, 65, 50, 80, 55, 70, 60].map((h, i) => (
          <div key={i} className="w-full rounded-t bg-slate-200" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Table skeleton
// ——————————————————————————————————————————

/** A pulsing placeholder that mirrors the Recent Entries table. */
export function TableSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      {/* Title */}
      <div className="mb-4 h-5 w-36 rounded bg-slate-200" />
      {/* Header row */}
      <div className="flex gap-4 border-b border-slate-200 pb-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-slate-200" />
        ))}
      </div>
      {/* Body rows */}
      {[...Array(5)].map((_, row) => (
        <div key={row} className="flex gap-4 border-b border-slate-100 py-3">
          {[...Array(5)].map((_, col) => (
            <div key={col} className="h-4 flex-1 rounded bg-slate-200" />
          ))}
        </div>
      ))}
    </div>
  );
}

// ——————————————————————————————————————————
// Pie / donut chart skeleton
// ——————————————————————————————————————————

/** A pulsing placeholder that mimics the donut-style sleep distribution chart. */
export function PieChartSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      <div className="mb-4 h-5 w-52 rounded bg-slate-200" />
      <div className="flex h-80 items-center justify-center">
        {/* Donut ring */}
        <div className="h-48 w-48 rounded-full border-[32px] border-slate-200 bg-white" />
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Full dashboard skeleton (composed)
// ——————————————————————————————————————————

/**
 * Composes all skeleton pieces into the same grid layout as the real
 * dashboard, so the transition from loading → loaded is seamless.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading dashboard…</span>
      {/* Stats grid — 4 cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>

      {/* Charts row 1 — 2 columns */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>

      {/* Charts row 2 — table (2/3) + donut (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TableSkeleton />
        </div>
        <PieChartSkeleton />
      </div>
    </div>
  );
}
