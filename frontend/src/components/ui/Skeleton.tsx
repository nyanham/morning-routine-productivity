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
 * - `ProfileBannerSkeleton` — replaces the top profile banner
 * - `TabsSkeleton`          — replaces the dashboard tab bar
 * - `ChartSkeleton`         — replaces a chart card (line, bar, or pie)
 * - `EntryPanelSkeleton`    — replaces a single routine entry panel
 * - `SidebarCardSkeleton`   — replaces a right-sidebar card
 * - `DashboardSkeleton`     — composes all of the above into the full layout
 */

// ——————————————————————————————————————————
// Profile banner skeleton
// ——————————————————————————————————————————

export function ProfileBannerSkeleton() {
  return (
    <div
      className="flex animate-pulse items-center gap-5 rounded-2xl bg-white/65 px-6 py-5 backdrop-blur-md"
      aria-hidden="true"
    >
      <div className="h-16 w-16 shrink-0 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-5 w-40 rounded bg-slate-200" />
        <div className="h-3 w-28 rounded bg-slate-200" />
      </div>
      <div className="h-10 w-44 rounded-xl bg-slate-200" />
    </div>
  );
}

// ——————————————————————————————————————————
// Tabs skeleton
// ——————————————————————————————————————————

export function TabsSkeleton() {
  return (
    <div className="flex animate-pulse gap-1 border-b border-slate-200/40 pb-3" aria-hidden="true">
      {[80, 72, 88, 64].map((w, i) => (
        <div key={i} className="h-4 rounded bg-slate-200" style={{ width: w }} />
      ))}
    </div>
  );
}

// ——————————————————————————————————————————
// Chart skeleton
// ——————————————————————————————————————————

/** A pulsing placeholder that mirrors a chart card (title bar + 20rem (h-80) chart area). */
export function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white/60 p-5 backdrop-blur-md" aria-hidden="true">
      <div className="mb-4 h-5 w-48 rounded bg-slate-200" />
      <div className="flex h-60 items-end justify-between gap-2 px-4 pb-4">
        {[40, 65, 50, 80, 55, 70, 60].map((h, i) => (
          <div key={i} className="w-full rounded-t bg-slate-200" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Entry panel skeleton
// ——————————————————————————————————————————

export function EntryPanelSkeleton() {
  return (
    <div
      className="flex animate-pulse items-center gap-3 rounded-xl bg-white/50 px-5 py-4 backdrop-blur-md"
      aria-hidden="true"
    >
      <div className="h-5 w-5 rounded bg-slate-200" />
      <div className="flex-1 space-y-1">
        <div className="h-4 w-32 rounded bg-slate-200" />
      </div>
      <div className="h-6 w-20 rounded-full bg-slate-200" />
      <div className="h-5 w-5 rounded bg-slate-200" />
    </div>
  );
}

// ——————————————————————————————————————————
// Sidebar card skeleton
// ——————————————————————————————————————————

export function SidebarCardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="animate-pulse rounded-2xl bg-white/65 p-5 backdrop-blur-md" aria-hidden="true">
      <div className="mb-4 h-5 w-36 rounded bg-slate-200" />
      <div className="space-y-3">
        {[...Array(lines)].map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-3 flex-1 rounded bg-slate-200" />
            <div className="h-10 w-10 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// StatsCard skeleton (kept for backward compat)
// ——————————————————————————————————————————

export function StatsCardSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-8 w-16 rounded bg-slate-200" />
          <div className="h-3 w-20 rounded bg-slate-200" />
        </div>
        <div className="h-12 w-12 rounded-lg bg-slate-200" />
      </div>
      <div className="mt-4 flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-slate-200" />
        <div className="h-3 w-20 rounded bg-slate-200" />
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Pie / donut chart skeleton (kept for other pages)
// ——————————————————————————————————————————

export function PieChartSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      <div className="mb-4 h-5 w-52 rounded bg-slate-200" />
      <div className="flex h-80 items-center justify-center">
        <div className="h-48 w-48 rounded-full border-32 border-slate-200 bg-white" />
      </div>
    </div>
  );
}

// ——————————————————————————————————————————
// Table skeleton (kept for other pages)
// ——————————————————————————————————————————

export function TableSkeleton() {
  return (
    <div className="card animate-pulse" aria-hidden="true">
      <div className="mb-4 h-5 w-36 rounded bg-slate-200" />
      <div className="flex gap-4 border-b border-slate-200 pb-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-4 flex-1 rounded bg-slate-200" />
        ))}
      </div>
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
// Full dashboard skeleton (composed)
// ——————————————————————————————————————————

/**
 * Composes all skeleton pieces into the same grid layout as the
 * redesigned dashboard, so the transition from loading → loaded
 * is seamless.
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-live="polite">
      <span className="sr-only">Loading dashboard…</span>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-8 lg:col-span-2">
          <ChartSkeleton />
          <div className="space-y-3">
            <div className="mb-3 h-3 w-24 rounded bg-slate-200" />
            {[...Array(4)].map((_, i) => (
              <EntryPanelSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-8">
          <SidebarCardSkeleton lines={2} />
          <SidebarCardSkeleton lines={4} />
        </div>
      </div>
    </div>
  );
}
