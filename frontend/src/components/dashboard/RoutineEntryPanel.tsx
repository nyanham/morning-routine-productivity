'use client';

import { useState } from 'react';
import { ChevronDown, AlertTriangle, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import MetricRangeBar from './MetricRangeBar';
import type { MorningRoutine, ProductivityEntry } from '@/types';

interface RoutineEntryPanelProps {
  routine: MorningRoutine;
  productivity?: ProductivityEntry;
  /** If true, the panel starts in the expanded state. */
  defaultExpanded?: boolean;
}

/**
 * Expandable card for a single day's routine.
 *
 * Mirrors the lab-result panel from the reference design:
 * collapsed → date + mood badge + chevron;
 * expanded  → full metric list with range bars.
 */
export default function RoutineEntryPanel({
  routine,
  productivity,
  defaultExpanded = false,
}: RoutineEntryPanelProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const dateFormatted = new Date(routine.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const wakeTimeFormatted = (() => {
    if (!routine.wake_time) return '';
    const [h, m] = routine.wake_time.split(':');
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
  })();

  // ── Metric definitions (label + range + optimal zone) ──
  const metrics: {
    label: string;
    value: number;
    min: number;
    max: number;
    optimalMin: number;
    optimalMax: number;
    unit: string;
    warning: boolean;
  }[] = [
    {
      label: 'Sleep Duration',
      value: routine.sleep_duration_hours,
      min: 4,
      max: 12,
      optimalMin: 7,
      optimalMax: 9,
      unit: 'hrs',
      warning: routine.sleep_duration_hours < 6 || routine.sleep_duration_hours > 10,
    },
    {
      label: 'Morning Mood',
      value: routine.morning_mood,
      min: 1,
      max: 10,
      optimalMin: 6,
      optimalMax: 10,
      unit: '/10',
      warning: routine.morning_mood <= 4,
    },
    {
      label: 'Exercise',
      value: routine.exercise_minutes,
      min: 0,
      max: 120,
      optimalMin: 20,
      optimalMax: 60,
      unit: 'min',
      warning: routine.exercise_minutes === 0,
    },
    {
      label: 'Meditation',
      value: routine.meditation_minutes,
      min: 0,
      max: 60,
      optimalMin: 10,
      optimalMax: 30,
      unit: 'min',
      warning: false,
    },
  ];

  if (productivity) {
    metrics.push(
      {
        label: 'Productivity Score',
        value: productivity.productivity_score,
        min: 1,
        max: 10,
        optimalMin: 6,
        optimalMax: 10,
        unit: '/10',
        warning: productivity.productivity_score <= 4,
      },
      {
        label: 'Energy Level',
        value: productivity.energy_level,
        min: 1,
        max: 10,
        optimalMin: 5,
        optimalMax: 10,
        unit: '/10',
        warning: productivity.energy_level <= 3,
      }
    );
  }

  return (
    <div className="rounded-xl bg-white/50 backdrop-blur-md transition-all">
      {/* Collapsed header */}
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/30"
        aria-expanded={expanded}
      >
        <Sun className="text-vanilla-400 h-5 w-5 shrink-0" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <span className="font-semibold text-slate-700">{dateFormatted}</span>
          {wakeTimeFormatted && (
            <span className="ml-2 text-sm text-slate-400">(Wake: {wakeTimeFormatted})</span>
          )}
        </div>

        {/* Mood badge — color-coded like the reference */}
        <span
          className={cn(
            'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
            routine.morning_mood >= 7
              ? 'bg-emerald-100/60 text-emerald-700'
              : routine.morning_mood >= 5
                ? 'bg-amber-100/60 text-amber-700'
                : 'bg-red-100/60 text-red-700'
          )}
        >
          Mood {routine.morning_mood}/10
        </span>

        <ChevronDown
          className={cn(
            'h-5 w-5 shrink-0 text-slate-400 transition-transform',
            expanded && 'rotate-180'
          )}
          aria-hidden="true"
        />
      </button>

      {/* Expanded metrics */}
      {expanded && (
        <div className="space-y-3 border-t border-slate-200/30 px-5 pt-4 pb-5">
          {metrics.map((m) => (
            <div key={m.label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 truncate text-sm text-slate-600">{m.label}</span>
              <span className="w-20 shrink-0 text-right text-sm font-semibold text-slate-800">
                {m.value} <span className="font-normal text-slate-400">{m.unit}</span>
              </span>
              {m.warning && (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" aria-label="Warning" />
              )}
              <MetricRangeBar
                value={m.value}
                min={m.min}
                max={m.max}
                optimalMin={m.optimalMin}
                optimalMax={m.optimalMax}
                isWarning={m.warning}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
