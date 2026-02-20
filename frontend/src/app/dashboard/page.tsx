'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import StatsCard from '@/components/ui/StatsCard';
import { ProductivityChart, RoutineBarChart, SleepDistributionChart } from '@/components/charts';
import { RequireAuth } from '@/contexts/AuthContext';
import { useRoutines, useProductivity, useAnalyticsSummary, useChartData } from '@/hooks/useApi';
import { DashboardSkeleton } from '@/components/ui/Skeleton';
import { Clock, Target, Zap, Moon, AlertCircle, RefreshCw } from 'lucide-react';
import type { MorningRoutine, ProductivityEntry } from '@/types';

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Format time for display
function formatTime(timeStr: string): string {
  if (!timeStr) return '-';
  const [hours, minutes] = timeStr.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const displayHour = h % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

function DashboardContent() {
  const routines = useRoutines();
  const productivity = useProductivity();
  const summary = useAnalyticsSummary();
  const chartData = useChartData();
  const [dateRange] = useState({ days: 7 });

  // Track whether the very first fetch cycle has completed so we never
  // flash demo data before the skeleton has a chance to appear.
  const [initialLoad, setInitialLoad] = useState(true);

  // Fetch data on mount
  useEffect(() => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - dateRange.days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    Promise.allSettled([
      routines.fetch({ pageSize: 10, startDate, endDate }),
      productivity.fetch({ pageSize: 10, startDate, endDate }),
      summary.fetch(startDate, endDate),
      chartData.fetch(startDate, endDate),
    ]).finally(() => setInitialLoad(false));
  }, [dateRange.days]);

  // Transform data for charts
  const productivityChartData = useMemo(() => {
    if (!productivity.data?.data?.length && !routines.data?.data?.length) {
      return [];
    }

    // Combine routine and productivity data by date
    const dataByDate = new Map<
      string,
      {
        date: string;
        productivity_score?: number;
        energy_level?: number;
        morning_mood?: number;
      }
    >();

    routines.data?.data?.forEach((r: MorningRoutine) => {
      const existing = dataByDate.get(r.date) || { date: formatDate(r.date) };
      dataByDate.set(r.date, {
        ...existing,
        morning_mood: r.morning_mood,
      });
    });

    productivity.data?.data?.forEach((p: ProductivityEntry) => {
      const existing = dataByDate.get(p.date) || { date: formatDate(p.date) };
      dataByDate.set(p.date, {
        ...existing,
        productivity_score: p.productivity_score,
        energy_level: p.energy_level,
      });
    });

    return Array.from(dataByDate.values()).sort((a, b) => a.date.localeCompare(b.date));
  }, [routines.data, productivity.data]);

  const routineChartData = useMemo(() => {
    if (!routines.data?.data?.length) {
      return [];
    }

    return routines.data.data.map((r: MorningRoutine) => ({
      date: formatDate(r.date),
      sleep_duration_hours: r.sleep_duration_hours,
      exercise_minutes: r.exercise_minutes,
      meditation_minutes: r.meditation_minutes,
    }));
  }, [routines.data]);

  const sleepDistribution = useMemo(() => {
    if (!routines.data?.data?.length) {
      return [];
    }

    const distribution = { '<6': 0, '6-7': 0, '7-8': 0, '>8': 0 };
    routines.data.data.forEach((r: MorningRoutine) => {
      const hours = r.sleep_duration_hours;
      if (hours < 6) distribution['<6']++;
      else if (hours < 7) distribution['6-7']++;
      else if (hours < 8) distribution['7-8']++;
      else distribution['>8']++;
    });

    const total = routines.data.data.length;
    return [
      {
        name: '<6 hrs',
        value: Math.round((distribution['<6'] / total) * 100) || 0,
        color: '#ef4444',
      },
      {
        name: '6-7 hrs',
        value: Math.round((distribution['6-7'] / total) * 100) || 0,
        color: '#f97316',
      },
      {
        name: '7-8 hrs',
        value: Math.round((distribution['7-8'] / total) * 100) || 0,
        color: '#22c55e',
      },
      {
        name: '>8 hrs',
        value: Math.round((distribution['>8'] / total) * 100) || 0,
        color: '#3b82f6',
      },
    ];
  }, [routines.data]);

  // Recent entries for the table
  const recentEntries = useMemo(() => {
    if (!routines.data?.data?.length && !productivity.data?.data?.length) {
      return [];
    }

    const routineMap = new Map(routines.data?.data?.map((r: MorningRoutine) => [r.date, r]) || []);
    const productivityMap = new Map(
      productivity.data?.data?.map((p: ProductivityEntry) => [p.date, p]) || []
    );

    // Get all unique dates
    const allDates = new Set([
      ...(routines.data?.data?.map((r: MorningRoutine) => r.date) || []),
      ...(productivity.data?.data?.map((p: ProductivityEntry) => p.date) || []),
    ]);

    return Array.from(allDates)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 5)
      .map((date) => {
        const r = routineMap.get(date);
        const p = productivityMap.get(date);
        return {
          date: formatDate(date),
          wake: r ? formatTime(r.wake_time) : '-',
          sleep: r ? `${r.sleep_duration_hours} hrs` : '-',
          prod: p?.productivity_score ?? '-',
          mood: r?.morning_mood ?? '-',
        };
      });
  }, [routines.data, productivity.data]);

  const isLoading = initialLoad || routines.loading || productivity.loading || summary.loading;
  const hasError = routines.error || productivity.error || summary.error;
  const hasData = routines.data?.data?.length || productivity.data?.data?.length;

  // Refresh data
  const handleRefresh = () => {
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - dateRange.days * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    routines.fetch({ pageSize: 10, startDate, endDate });
    productivity.fetch({ pageSize: 10, startDate, endDate });
    summary.fetch(startDate, endDate);
    chartData.fetch(startDate, endDate);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="mt-1 text-slate-600">
            Track your morning routine and productivity patterns
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
          <div className="text-sm text-red-800">
            <p className="font-medium">Error loading data</p>
            <p>{routines.error || productivity.error || summary.error}</p>
          </div>
        </div>
      )}

      {/* No Data Banner */}
      {!isLoading && !hasData && !hasError && (
        <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">No data yet</p>
            <p>Start by importing a CSV file or adding entries manually.</p>
          </div>
        </div>
      )}

      {/* Skeleton loading state — shown whenever dashboard data is loading */}
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Avg. Productivity"
              value={summary.data?.avg_productivity?.toFixed(1) ?? '-'}
              subtitle="out of 10"
              trend={summary.data?.productivity_trend}
              trendValue={
                summary.data?.productivity_trend === 'up'
                  ? 'trending up'
                  : summary.data?.productivity_trend === 'down'
                    ? 'trending down'
                    : summary.data?.productivity_trend === 'stable'
                      ? 'stable'
                      : undefined
              }
              icon={<Target className="text-primary-600 h-6 w-6" />}
            />
            <StatsCard
              title="Avg. Sleep"
              value={summary.data?.avg_sleep ? `${summary.data.avg_sleep.toFixed(1)} hrs` : '-'}
              subtitle="per night"
              icon={<Moon className="text-primary-600 h-6 w-6" />}
            />
            <StatsCard
              title="Total Entries"
              value={String(summary.data?.total_entries ?? routines.data?.total ?? 0)}
              subtitle="this period"
              icon={<Clock className="text-primary-600 h-6 w-6" />}
            />
            <StatsCard
              title="Avg. Exercise"
              value={
                summary.data?.avg_exercise ? `${Math.round(summary.data.avg_exercise)} min` : '-'
              }
              subtitle="per day"
              icon={<Zap className="text-primary-600 h-6 w-6" />}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ProductivityChart data={productivityChartData} />
            <RoutineBarChart data={routineChartData} />
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="card">
                <h3 className="mb-4 text-lg font-semibold text-slate-900">Recent Entries</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Date</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Wake Time
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Sleep</th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">
                          Productivity
                        </th>
                        <th className="px-4 py-3 text-left font-medium text-slate-600">Mood</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentEntries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                            No entries yet
                          </td>
                        </tr>
                      ) : (
                        recentEntries.map((row) => (
                          <tr key={row.date} className="border-b border-slate-100">
                            <td className="px-4 py-3 text-slate-700">{row.date}</td>
                            <td className="px-4 py-3 text-slate-700">{row.wake}</td>
                            <td className="px-4 py-3 text-slate-700">{row.sleep}</td>
                            <td className="px-4 py-3">
                              {typeof row.prod === 'number' ? (
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    row.prod >= 8
                                      ? 'bg-green-100 text-green-800'
                                      : row.prod >= 6
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {row.prod}/10
                                </span>
                              ) : (
                                <span className="text-slate-400">{row.prod}</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-slate-700">
                              {typeof row.mood === 'number' ? `${row.mood}/10` : row.mood}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <SleepDistributionChart data={sleepDistribution} />
          </div>
        </>
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
