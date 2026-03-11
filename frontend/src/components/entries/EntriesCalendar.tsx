import { cn, formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MorningRoutine, ProductivityEntry } from '@/types';

import EntryDetail from './EntryDetail';

interface EntriesCalendarProps {
  /** All routine entries for the current month. */
  entries: MorningRoutine[];
  /** Productivity entries keyed by date string (YYYY-MM-DD). */
  productivityByDate: Map<string, ProductivityEntry>;
  /** Currently viewed year. */
  year: number;
  /** Currently viewed month (0-indexed). */
  month: number;
  /** Navigate to a different month. */
  onMonthChange: (year: number, month: number) => void;
  /** Currently selected entry id. */
  selectedId: string | null;
  /** Select or deselect an entry. */
  onSelect: (id: string | null) => void;
  /** Request deletion for an entry. */
  onDelete: (routine: MorningRoutine) => void;
}

/** Day-of-week header labels. */
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Maps a productivity score (1-10) to a background + text colour pair.
 *
 * Uses the project palette where possible:
 * - 1-2  → red   (poor)
 * - 3-4  → amber (below average)
 * - 5-6  → yellow (average)
 * - 7-8  → teal  (good)
 * - 9-10 → green (excellent)
 */
function scoreColors(score: number): string {
  if (score <= 2) return 'bg-red-500/80 text-white';
  if (score <= 4) return 'bg-amber-400/80 text-slate-900';
  if (score <= 6) return 'bg-yellow-300/70 text-slate-900';
  if (score <= 8) return 'bg-emerald-400/70 text-slate-900';
  return 'bg-emerald-600/80 text-white';
}

/**
 * Renders a monthly calendar grid where each day with data is
 * colour-coded by productivity score. Clicking a day opens the
 * detail panel for that entry.
 */
export default function EntriesCalendar({
  entries,
  productivityByDate,
  year,
  month,
  onMonthChange,
  selectedId,
  onSelect,
  onDelete,
}: EntriesCalendarProps) {
  /* ---- derived data ---- */
  const entriesByDate = new Map(entries.map((r) => [r.date, r]));

  const firstDay = new Date(year, month, 1);
  const startDow = firstDay.getDay(); // 0 = Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthLabel = firstDay.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const today = new Date();
  const todayStr =
    today.getFullYear() === year && today.getMonth() === month ? String(today.getDate()) : null;

  /* ---- selected entry ---- */
  const selectedRoutine = entries.find((r) => r.id === selectedId) ?? null;
  const selectedProductivity = selectedRoutine
    ? productivityByDate.get(selectedRoutine.date)
    : undefined;

  /* ---- navigation helpers ---- */
  const goToPrevMonth = () => {
    const prev = new Date(year, month - 1, 1);
    onMonthChange(prev.getFullYear(), prev.getMonth());
  };

  const goToNextMonth = () => {
    const next = new Date(year, month + 1, 1);
    onMonthChange(next.getFullYear(), next.getMonth());
  };

  const goToToday = () => {
    const now = new Date();
    onMonthChange(now.getFullYear(), now.getMonth());
  };

  /* ---- build calendar cells ---- */
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Calendar grid */}
      <div className={cn(selectedRoutine ? 'lg:col-span-3' : 'lg:col-span-5')}>
        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between">
          <button
            type="button"
            onClick={goToPrevMonth}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/50"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-800">{monthLabel}</h2>
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
            >
              Today
            </button>
          </div>

          <button
            type="button"
            onClick={goToNextMonth}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/50"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div
          className="grid grid-cols-7 gap-1"
          role="grid"
          aria-label={`Calendar for ${monthLabel}`}
        >
          {cells.map((day, idx) => {
            if (day === null) {
              return <div key={`empty-${idx}`} className="aspect-square" role="gridcell" />;
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const routine = entriesByDate.get(dateStr);
            const prod = productivityByDate.get(dateStr);
            const score = prod?.productivity_score;
            const hasEntry = !!routine;
            const isSelected = routine?.id === selectedId && selectedId !== null;
            const isToday = String(day) === todayStr;

            return (
              <button
                key={dateStr}
                type="button"
                role="gridcell"
                aria-label={`${formatDate(dateStr)}${score ? `, productivity score ${score} out of 10` : ''}${hasEntry ? '' : ', no entry'}`}
                aria-selected={isSelected}
                disabled={!hasEntry}
                onClick={() => {
                  if (!routine) return;
                  onSelect(routine.id === selectedId ? null : routine.id);
                }}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-all',
                  // base styling
                  hasEntry
                    ? 'hover:ring-aqua-400/50 cursor-pointer hover:ring-2'
                    : 'cursor-default opacity-60',
                  // score-based colour
                  hasEntry && score ? scoreColors(score) : !hasEntry && 'bg-slate-100/40',
                  // entry exists but no productivity score
                  hasEntry && !score && 'bg-slate-200/60 text-slate-700',
                  // today ring
                  isToday && 'ring-aqua-600 ring-2',
                  // selected highlight
                  isSelected && 'ring-aqua-400 ring-2 ring-offset-2'
                )}
              >
                <span className={cn('font-medium', isToday && !hasEntry && 'text-aqua-600')}>
                  {day}
                </span>
                {hasEntry && score && (
                  <span className="text-[10px] leading-none opacity-80">{score}/10</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-red-500/80" aria-hidden="true" />
            1-2
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-amber-400/80" aria-hidden="true" />
            3-4
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-yellow-300/70" aria-hidden="true" />
            5-6
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-emerald-400/70" aria-hidden="true" />
            7-8
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-emerald-600/80" aria-hidden="true" />
            9-10
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-slate-200/60" aria-hidden="true" />
            No score
          </span>
        </div>
      </div>

      {/* Detail panel (slides in on select) */}
      {selectedRoutine && (
        <div className="lg:sticky lg:top-24 lg:col-span-2 lg:self-start">
          <EntryDetail
            routine={selectedRoutine}
            productivity={selectedProductivity}
            onClose={() => onSelect(null)}
            onDelete={() => onDelete(selectedRoutine)}
          />
        </div>
      )}
    </div>
  );
}
