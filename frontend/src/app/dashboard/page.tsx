'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ProductivityChart } from '@/components/charts';
import {
  DashboardTabs,
  RoutineEntryPanel,
  SummaryCard,
  InsightsCard,
} from '@/components/dashboard';
import { RequireAuth } from '@/contexts/AuthContext';
import { useRoutines, useProductivity, useAnalyticsSummary } from '@/hooks/useApi';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { AlertCircle } from 'lucide-react';
import type { MorningRoutine, ProductivityEntry } from '@/types';

// ── helpers ──

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Group an array of items by a key derived from each item. */
function groupBy<T>(items: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    (acc[key] ??= []).push(item);
    return acc;
  }, {});
}

// ── main content ──

function DashboardContent() {
  const routines = useRoutines();
  const productivity = useProductivity();
  const summary = useAnalyticsSummary();
  const [dateRange] = useState({ days: 30 });

  const { fetch: fetchRoutines } = routines;
  const { fetch: fetchProductivity } = productivity;
  const { fetch: fetchSummary } = summary;

  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - dateRange.days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    let cancelled = false;

    Promise.allSettled([
      fetchRoutines({ pageSize: 30, startDate, endDate }),
      fetchProductivity({ pageSize: 30, startDate, endDate }),
      fetchSummary(startDate, endDate),
    ]).finally(() => {
      if (!cancelled) setInitialLoad(false);
    });

    return () => {
      cancelled = true;
    };
  }, [dateRange.days, fetchRoutines, fetchProductivity, fetchSummary]);

  // ── Derived data ──

  /** Productivity chart data: combines routine mood + productivity scores by date. */
  const productivityChartData = useMemo(() => {
    if (!productivity.data?.data?.length && !routines.data?.data?.length) return [];

    const dataByDate = new Map<
      string,
      { date: string; productivity_score?: number; energy_level?: number; morning_mood?: number }
    >();

    routines.data?.data?.forEach((r: MorningRoutine) => {
      const existing = dataByDate.get(r.date) || { date: formatDate(r.date) };
      dataByDate.set(r.date, { ...existing, morning_mood: r.morning_mood });
    });

    productivity.data?.data?.forEach((p: ProductivityEntry) => {
      const existing = dataByDate.get(p.date) || { date: formatDate(p.date) };
      dataByDate.set(p.date, {
        ...existing,
        productivity_score: p.productivity_score,
        energy_level: p.energy_level,
      });
    });

    return Array.from(dataByDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [routines.data, productivity.data]);

  /** Routine entries grouped by month (e.g. "March 2026"). */
  const routinesByMonth = useMemo(() => {
    const items = routines.data?.data ?? [];
    return groupBy(items, (r: MorningRoutine) =>
      new Date(r.date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    );
  }, [routines.data]);

  /** Lookup map: date → ProductivityEntry, for pairing with routines. */
  const productivityByDate = useMemo(() => {
    return new Map(productivity.data?.data?.map((p: ProductivityEntry) => [p.date, p]) ?? []);
  }, [productivity.data]);

  // Month keys sorted newest-first so recent entries appear at the top.
  const monthKeys = useMemo(
    () =>
      Object.keys(routinesByMonth).sort((a, b) => {
        const da = new Date(routinesByMonth[a][0]?.date ?? '');
        const db = new Date(routinesByMonth[b][0]?.date ?? '');
        return db.getTime() - da.getTime();
      }),
    [routinesByMonth]
  );

  const isLoading = initialLoad || routines.loading || productivity.loading || summary.loading;
  const hasError = routines.error || productivity.error || summary.error;
  const hasData = routines.data?.data?.length || productivity.data?.data?.length;

  // ── Sidebar summary values ──
  const routineCount = routines.data?.data?.length ?? 0;
  const productivityCount = productivity.data?.data?.length ?? 0;
  const totalEntries = summary.data?.total_entries ?? routineCount + productivityCount;

  // Compute avg mood from routine data (not always in summary).
  const avgMood = useMemo(() => {
    const items = routines.data?.data ?? [];
    if (items.length === 0) return null;
    return items.reduce((sum: number, r: MorningRoutine) => sum + r.morning_mood, 0) / items.length;
  }, [routines.data]);

  return (
    <div className="space-y-8">
      {/* ── Tab navigation ── */}
      <DashboardTabs />

      {/* ── Error banner ── */}
      {hasError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50/60 p-4 backdrop-blur-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="text-sm text-red-800">
            <p className="font-medium">Error loading data</p>
            <p>{routines.error || productivity.error || summary.error}</p>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && !hasData && !hasError && (
        <div className="bg-aqua-100/30 flex items-start gap-3 rounded-xl p-4 backdrop-blur-sm">
          <AlertCircle className="text-aqua-600 mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-aqua-800 text-sm">
            <p className="font-medium">No data yet</p>
            <p>Start by importing a CSV file or adding entries manually.</p>
          </div>
        </div>
      )}

      {/* ── Loading / Content ── */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* ═══ Left column: chart + monthly entry panels ═══ */}
          <div className="space-y-8 lg:col-span-2">
            {/* Compact productivity trend chart */}
            {productivityChartData.length > 0 && (
              <div className="rounded-2xl bg-white/60 p-5 backdrop-blur-md">
                <ProductivityChart data={productivityChartData} title="Weekly Trends" />
              </div>
            )}

            {/* Monthly entry groups (newest first) */}
            {monthKeys.length > 0 ? (
              monthKeys.map((month) => (
                <section key={month}>
                  <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
                    {month}
                  </h3>
                  <div className="space-y-3">
                    {routinesByMonth[month]
                      .sort((a, b) => b.date.localeCompare(a.date))
                      .map((routine, idx) => (
                        <RoutineEntryPanel
                          key={routine.id}
                          routine={routine}
                          productivity={productivityByDate.get(routine.date)}
                          defaultExpanded={idx === 0 && month === monthKeys[0]}
                        />
                      ))}
                  </div>
                </section>
              ))
            ) : (
              <div className="rounded-2xl bg-white/50 px-6 py-12 text-center backdrop-blur-md">
                <p className="text-sm text-slate-400">
                  No routine entries yet. Log your first morning routine!
                </p>
              </div>
            )}
          </div>

          {/* ═══ Right column: summary donut + wellness insights ═══ */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            <SummaryCard
              totalEntries={totalEntries}
              routineCount={routineCount}
              productivityCount={productivityCount}
              avgMood={avgMood}
              avgSleep={summary.data?.avg_sleep ?? null}
            />
            <InsightsCard summary={summary.data} />
          </aside>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <RequireAuth>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
