'use client';

import { useState, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Pre-defined quick-select date ranges. */
const DATE_PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 6 months', days: 180 },
  { label: 'Last year', days: 365 },
] as const;

/** Metrics available for filtering / charting. */
export const METRIC_OPTIONS = [
  { value: 'productivity_score', label: 'Productivity Score' },
  { value: 'energy_level', label: 'Energy Level' },
  { value: 'morning_mood', label: 'Morning Mood' },
  { value: 'sleep_duration_hours', label: 'Sleep Duration' },
  { value: 'exercise_minutes', label: 'Exercise (min)' },
  { value: 'meditation_minutes', label: 'Meditation (min)' },
  { value: 'stress_level', label: 'Stress Level' },
  { value: 'focus_hours', label: 'Focus Hours' },
  { value: 'tasks_completed', label: 'Tasks Completed' },
] as const;

export type MetricKey = (typeof METRIC_OPTIONS)[number]['value'];

/** Grouping granularity for chart aggregation. */
export const GROUP_OPTIONS = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
  { value: 'day-of-week', label: 'Day of Week' },
] as const;

export type GroupKey = (typeof GROUP_OPTIONS)[number]['value'];

export interface StatsFilters {
  days: number;
  startDate: string;
  endDate: string;
  metric: MetricKey;
  groupBy: GroupKey;
}

interface StatsFilterPanelProps {
  filters: StatsFilters;
  onChange: (filters: StatsFilters) => void;
  /** Hide the group-by selector (e.g. for correlations page). */
  hideGroupBy?: boolean;
  /** Hide the metric selector. */
  hideMetric?: boolean;
}

/**
 * Re-usable filter panel for statistics pages.
 *
 * Provides date-range quick-selects, a metric picker, and a group-by
 * selector. All changes are propagated upward via `onChange`.
 */
export default function StatsFilterPanel({
  filters,
  onChange,
  hideGroupBy = false,
  hideMetric = false,
}: StatsFilterPanelProps) {
  const [showDatePresets, setShowDatePresets] = useState(false);

  const handlePreset = useCallback(
    (days: number) => {
      const now = Date.now();
      const endDate = new Date(now).toISOString().split('T')[0];
      const startDate = new Date(now - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      onChange({ ...filters, days, startDate, endDate });
      setShowDatePresets(false);
    },
    [filters, onChange]
  );

  const selectedPreset = DATE_PRESETS.find((p) => p.days === filters.days);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Date range selector */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setShowDatePresets((s) => !s)}
          className={cn(
            'flex items-center gap-2 rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/70',
            showDatePresets && 'ring-aqua-400 ring-2'
          )}
          aria-expanded={showDatePresets ? 'true' : 'false'}
          aria-haspopup="menu"
        >
          <Calendar className="h-4 w-4 text-slate-400" aria-hidden="true" />
          {selectedPreset?.label ?? 'Custom range'}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-slate-400 transition-transform',
              showDatePresets && 'rotate-180'
            )}
            aria-hidden="true"
          />
        </button>

        {showDatePresets && (
          <ul
            role="menu"
            aria-label="Select date range"
            className="absolute top-full left-0 z-20 mt-1 min-w-45 rounded-xl border border-slate-200/60 bg-white/90 py-1 shadow-lg backdrop-blur-md"
          >
            {DATE_PRESETS.map((preset) => (
              <li key={preset.days} role="menuitem">
                <button
                  type="button"
                  onClick={() => handlePreset(preset.days)}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm transition-colors',
                    filters.days === preset.days
                      ? 'bg-aqua-50 text-aqua-700 font-medium'
                      : 'text-slate-600 hover:bg-slate-50'
                  )}
                  aria-current={filters.days === preset.days ? 'true' : undefined}
                >
                  {preset.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Metric selector */}
      {!hideMetric && (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="sr-only">Metric</span>
          <select
            value={filters.metric}
            onChange={(e) => onChange({ ...filters, metric: e.target.value as MetricKey })}
            className="focus:ring-aqua-400 rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/70 focus:ring-2 focus:outline-none"
            aria-label="Select metric"
          >
            {METRIC_OPTIONS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      )}

      {/* Group by selector */}
      {!hideGroupBy && (
        <label className="flex items-center gap-2 text-sm text-slate-600">
          <span className="sr-only">Group by</span>
          <select
            value={filters.groupBy}
            onChange={(e) => onChange({ ...filters, groupBy: e.target.value as GroupKey })}
            className="focus:ring-aqua-400 rounded-xl border border-slate-200/60 bg-white/50 px-3 py-2 text-sm font-medium text-slate-700 backdrop-blur-sm transition-colors hover:bg-white/70 focus:ring-2 focus:outline-none"
            aria-label="Group by"
          >
            {GROUP_OPTIONS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>
      )}
    </div>
  );
}
