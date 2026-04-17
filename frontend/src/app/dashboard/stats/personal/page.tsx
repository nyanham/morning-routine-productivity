'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Download, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/contexts/AuthContext';
import { StatsFilterPanel, METRIC_OPTIONS } from '@/components/statistics';
import type { StatsFilters, MetricKey } from '@/components/statistics';
import { useRoutines, useProductivity, useAnalyticsSummary } from '@/hooks/useApi';
import StatsCard from '@/components/ui/StatsCard';
import { ChartSkeleton } from '@/components/ui/Skeleton';
import type { MorningRoutine, ProductivityEntry } from '@/types';

// ── Helpers ──

/** Get a human-readable label for a metric key. */
function metricLabel(key: MetricKey): string {
  return METRIC_OPTIONS.find((m) => m.value === key)?.label ?? key;
}

/** Extract a metric value from a routine or productivity entry. */
function extractMetric(
  routines: MorningRoutine[],
  productivity: ProductivityEntry[],
  metric: MetricKey
): { date: string; value: number }[] {
  const ROUTINE_FIELDS: string[] = [
    'morning_mood',
    'sleep_duration_hours',
    'exercise_minutes',
    'meditation_minutes',
  ];

  if (ROUTINE_FIELDS.includes(metric)) {
    return routines.map((r) => ({
      date: r.date,
      value: (r as unknown as Record<string, number>)[metric] ?? 0,
    }));
  }

  return productivity.map((p) => ({
    date: p.date,
    value: (p as unknown as Record<string, number>)[metric] ?? 0,
  }));
}

/** Aggregate data points by the selected grouping. */
function aggregateByGroup(
  data: { date: string; value: number }[],
  groupBy: string
): { label: string; avg: number; min: number; max: number; count: number }[] {
  const buckets = new Map<string, { sum: number; min: number; max: number; count: number }>();

  for (const point of data) {
    const d = new Date(point.date);
    let key: string;

    switch (groupBy) {
      case 'week': {
        // ISO week: find the Monday of the week
        const monday = new Date(d);
        monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
        key = monday.toISOString().split('T')[0];
        break;
      }
      case 'month':
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        break;
      case 'day-of-week':
        key = d.toLocaleDateString('en-US', { weekday: 'long' });
        break;
      default:
        key = point.date;
    }

    const bucket = buckets.get(key) ?? { sum: 0, min: Infinity, max: -Infinity, count: 0 };
    bucket.sum += point.value;
    bucket.min = Math.min(bucket.min, point.value);
    bucket.max = Math.max(bucket.max, point.value);
    bucket.count += 1;
    buckets.set(key, bucket);
  }

  // Sort — for day-of-week use fixed order, otherwise lexicographic
  const DOW_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return Array.from(buckets.entries())
    .sort(([a], [b]) => {
      if (groupBy === 'day-of-week') return DOW_ORDER.indexOf(a) - DOW_ORDER.indexOf(b);
      return a.localeCompare(b);
    })
    .map(([label, b]) => ({
      label: groupBy === 'week' ? `Week of ${label}` : label,
      avg: Math.round((b.sum / b.count) * 10) / 10,
      min: b.min === Infinity ? 0 : b.min,
      max: b.max === -Infinity ? 0 : b.max,
      count: b.count,
    }));
}

/** Format a date label for display. */
function formatLabel(label: string, groupBy: string): string {
  if (groupBy === 'day-of-week' || label.startsWith('Week of')) return label;
  if (groupBy === 'month') {
    const [y, m] = label.split('-');
    return new Date(Number(y), Number(m) - 1).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  }
  return new Date(label).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Export chart data as CSV. */
function exportCSV(
  data: { label: string; avg: number; min: number; max: number; count: number }[],
  metric: string
) {
  const header = 'Period,Average,Min,Max,Count';
  const rows = data.map((d) => `${d.label},${d.avg},${d.min},${d.max},${d.count}`);
  const csvContent = [header, ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${metric}_statistics.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ── Default filters ──

function defaultFilters(): StatsFilters {
  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return {
    days: 30,
    startDate,
    endDate,
    metric: 'productivity_score',
    groupBy: 'day',
  };
}

// ── Page content ──

function PersonalStatsContent() {
  const [filters, setFilters] = useState<StatsFilters>(defaultFilters);
  const routines = useRoutines();
  const productivity = useProductivity();
  const summary = useAnalyticsSummary();
  const [initialLoad, setInitialLoad] = useState(true);

  const { fetch: fetchRoutines } = routines;
  const { fetch: fetchProductivity } = productivity;
  const { fetch: fetchSummary } = summary;

  // Fetch data when filters change
  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      fetchRoutines({ pageSize: 1000, startDate: filters.startDate, endDate: filters.endDate }),
      fetchProductivity({ pageSize: 1000, startDate: filters.startDate, endDate: filters.endDate }),
      fetchSummary(filters.startDate, filters.endDate),
    ]).finally(() => {
      if (!cancelled) setInitialLoad(false);
    });

    return () => {
      cancelled = true;
    };
  }, [filters.startDate, filters.endDate, fetchRoutines, fetchProductivity, fetchSummary]);

  // Derive chart data
  const rawData = useMemo(
    () => extractMetric(routines.data?.data ?? [], productivity.data?.data ?? [], filters.metric),
    [routines.data, productivity.data, filters.metric]
  );

  const chartData = useMemo(
    () => aggregateByGroup(rawData, filters.groupBy),
    [rawData, filters.groupBy]
  );

  // Summary stats from data
  const stats = useMemo(() => {
    if (rawData.length === 0) return { avg: 0, min: 0, max: 0, count: 0, trend: 'stable' as const };

    const values = rawData.map((d) => d.value);
    const avg = values.reduce((s, v) => s + v, 0) / values.length;

    // Simple trend: compare first half vs second half averages
    const mid = Math.floor(values.length / 2);
    const firstHalf = values.slice(0, mid);
    const secondHalf = values.slice(mid);
    const firstAvg =
      firstHalf.length > 0 ? firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length : 0;
    const secondAvg =
      secondHalf.length > 0 ? secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length : 0;
    const diff = secondAvg - firstAvg;

    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (diff > avg * 0.05) trend = 'up';
    else if (diff < -avg * 0.05) trend = 'down';

    return {
      avg: Math.round(avg * 10) / 10,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
      trend,
    };
  }, [rawData]);

  const handleExport = useCallback(() => {
    exportCSV(chartData, filters.metric);
  }, [chartData, filters.metric]);

  const isLoading = initialLoad || routines.loading || productivity.loading;
  const hasError = routines.error || productivity.error;
  const hasData = rawData.length > 0;
  const useBarChart = filters.groupBy === 'day-of-week' || filters.groupBy === 'month';

  return (
    <div className="space-y-8">
      {/* Filters row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <StatsFilterPanel filters={filters} onChange={setFilters} />

        {hasData && (
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/70"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            Export CSV
          </button>
        )}
      </div>

      {/* Error banner */}
      {hasError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50/60 p-4 backdrop-blur-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" aria-hidden="true" />
          <div className="text-sm text-red-800">
            <p className="font-medium">Error loading data</p>
            <p>{routines.error || productivity.error}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-2xl bg-white/60 backdrop-blur-md"
                aria-hidden="true"
              />
            ))}
          </div>
          <ChartSkeleton />
        </div>
      ) : (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatsCard
              title={`Avg ${metricLabel(filters.metric)}`}
              value={stats.avg}
              trend={stats.trend}
              trendValue={
                stats.trend === 'up' ? 'Improving' : stats.trend === 'down' ? 'Declining' : 'Stable'
              }
            />
            <StatsCard title="Min" value={stats.min} />
            <StatsCard title="Max" value={stats.max} />
            <StatsCard title="Data Points" value={stats.count} subtitle="entries in range" />
          </div>

          {/* Chart */}
          {hasData ? (
            <div className="rounded-2xl bg-white/60 p-6 backdrop-blur-md">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">
                {metricLabel(filters.metric)} —{' '}
                {filters.groupBy === 'day-of-week'
                  ? 'by day of week'
                  : `grouped by ${filters.groupBy}`}
              </h2>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {useBarChart ? (
                    <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="label"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(v) => formatLabel(v, filters.groupBy)}
                      />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        labelFormatter={(v) => formatLabel(String(v), filters.groupBy)}
                      />
                      <Legend />
                      <Bar
                        dataKey="avg"
                        name={`Avg ${metricLabel(filters.metric)}`}
                        fill="#14a89e"
                        radius={[6, 6, 0, 0]}
                      />
                    </BarChart>
                  ) : (
                    <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis
                        dataKey="label"
                        stroke="#64748b"
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(v) => formatLabel(v, filters.groupBy)}
                      />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        }}
                        labelFormatter={(v) => formatLabel(String(v), filters.groupBy)}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="avg"
                        name={`Avg ${metricLabel(filters.metric)}`}
                        stroke="#14a89e"
                        strokeWidth={2}
                        dot={{ fill: '#14a89e', strokeWidth: 2 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="min"
                        name="Min"
                        stroke="#94a3b8"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="max"
                        name="Max"
                        stroke="#94a3b8"
                        strokeWidth={1}
                        strokeDasharray="4 4"
                        dot={false}
                      />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-white/50 px-6 py-16 text-center backdrop-blur-md">
              <p className="text-sm text-slate-400">
                No data available for the selected range. Try expanding the date range or adding
                more entries.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Page export ──

export default function PersonalStatsPage() {
  return (
    <RequireAuth>
      <DashboardLayout title="Your Statistics">
        <PersonalStatsContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
