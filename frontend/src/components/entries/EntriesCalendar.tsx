import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Plus, Upload } from 'lucide-react';
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

/** Short month names for the picker grid. */
const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Maps a productivity score (1-10) to a background + text colour pair.
 *
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
 * Monthly calendar grid where each day is colour-coded by
 * productivity score. Compact cells expand on hover to reveal
 * the score; clicking opens the detail panel. Empty days link
 * to the new-entry page for that date.
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
  /* ---- month-year picker state ---- */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerYear, setPickerYear] = useState(year);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close picker on click outside
  useEffect(() => {
    if (!pickerOpen) return;
    const handler = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pickerOpen]);

  // Keep pickerYear in sync when the parent changes the year
  useEffect(() => {
    setPickerYear(year);
  }, [year]);

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

  /* ---- build calendar rows (groups of 7 for proper grid semantics) ---- */
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  // Pad trailing cells so the last row is complete
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
      {/* Calendar grid */}
      <div className={cn(selectedRoutine ? 'lg:col-span-3' : 'lg:col-span-5')}>
        {/* Header — month nav + action buttons */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={goToPrevMonth}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/50"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Clickable month-year label + picker dropdown */}
            <div className="relative" ref={pickerRef}>
              <button
                type="button"
                onClick={() => {
                  setPickerOpen((o) => !o);
                  setPickerYear(year);
                }}
                className="rounded-lg px-3 py-1.5 text-lg font-semibold text-slate-800 transition-colors hover:bg-white/50"
                aria-expanded={pickerOpen ? 'true' : 'false'}
                aria-haspopup="dialog"
              >
                {monthLabel}
              </button>

              {pickerOpen && (
                <div
                  className="absolute left-1/2 z-20 mt-1 w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg"
                  role="dialog"
                  aria-label="Select month and year"
                >
                  {/* Year row */}
                  <div className="mb-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => y - 1)}
                      className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Previous year"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-semibold text-slate-700">{pickerYear}</span>
                    <button
                      type="button"
                      onClick={() => setPickerYear((y) => y + 1)}
                      className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                      aria-label="Next year"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Month grid */}
                  <div className="grid grid-cols-3 gap-1">
                    {MONTHS.map((m, i) => {
                      const isCurrent = i === month && pickerYear === year;
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            onMonthChange(pickerYear, i);
                            setPickerOpen(false);
                          }}
                          className={cn(
                            'rounded-lg px-2 py-1.5 text-xs font-medium transition-colors',
                            isCurrent
                              ? 'bg-aqua-600 text-white'
                              : 'text-slate-600 hover:bg-slate-100'
                          )}
                        >
                          {m}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/50"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goToToday}
              className="ml-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-200"
            >
              Today
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/import"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/50 px-3 py-2 text-sm font-medium text-slate-600 backdrop-blur-md transition-colors hover:bg-white/70"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Import CSV</span>
            </Link>
            <Link
              href="/dashboard/entry"
              className="bg-aqua-600 hover:bg-aqua-700 focus-visible:ring-aqua-400 inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">New Entry</span>
            </Link>
          </div>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 text-center text-xs font-semibold tracking-wider text-slate-400 uppercase">
          {WEEKDAYS.map((d) => (
            <div key={d} className="py-2">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells — grouped into rows for correct grid semantics */}
        <div role="grid" aria-label={`Calendar for ${monthLabel}`}>
          {rows.map((row, rowIdx) => (
            <div key={rowIdx} role="row" className="grid grid-cols-7 gap-1">
              {row.map((day, colIdx) => {
                if (day === null) {
                  return (
                    <div
                      key={`empty-${rowIdx}-${colIdx}`}
                      className="aspect-square"
                      role="gridcell"
                    />
                  );
                }

                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const routine = entriesByDate.get(dateStr);
                const prod = productivityByDate.get(dateStr);
                const score = prod?.productivity_score;
                const hasEntry = !!routine;
                const isSelected = routine?.id === selectedId && selectedId !== null;
                const isToday = String(day) === todayStr;

                /* Day WITH an entry — show detail on click */
                if (hasEntry) {
                  return (
                    <div key={dateStr} role="gridcell">
                      <button
                        type="button"
                        aria-label={`${formatDate(dateStr)}${score ? `, productivity ${score} out of 10` : ''}`}
                        aria-pressed={isSelected ? 'true' : 'false'}
                        onClick={() => onSelect(routine.id === selectedId ? null : routine.id)}
                        className={cn(
                          'group relative flex aspect-square w-full items-center justify-center rounded-lg text-xs font-medium transition-all duration-150',
                          'cursor-pointer hover:z-10 hover:scale-110 hover:shadow-md',
                          score ? scoreColors(score) : 'bg-slate-200/60 text-slate-700',
                          isToday && 'ring-aqua-600 ring-2',
                          isSelected && 'ring-aqua-400 ring-2 ring-offset-2'
                        )}
                      >
                        {day}
                        {score != null && (
                          <span className="absolute inset-x-0 bottom-0.5 text-center text-[9px] leading-none opacity-0 transition-opacity group-hover:opacity-80">
                            {score}/10
                          </span>
                        )}
                      </button>
                    </div>
                  );
                }

                /* Day WITHOUT an entry — link to add one */
                return (
                  <div key={dateStr} role="gridcell">
                    <Link
                      href={`/dashboard/entry?date=${dateStr}`}
                      aria-label={`${formatDate(dateStr)}, add entry`}
                      className={cn(
                        'group relative flex aspect-square w-full items-center justify-center rounded-lg text-xs font-medium transition-all duration-150',
                        'bg-slate-50/40 text-slate-400 hover:bg-slate-100/60 hover:text-slate-600',
                        isToday && 'ring-aqua-600 text-aqua-600 ring-2'
                      )}
                    >
                      {day}
                      <Plus
                        className="absolute bottom-0.5 h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-60"
                        aria-hidden="true"
                      />
                    </Link>
                  </div>
                );
              })}
            </div>
          ))}
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

        {/* Hint for an empty month */}
        {entries.length === 0 && (
          <p className="mt-3 text-center text-sm text-slate-400">
            Click any day to log your first entry.
          </p>
        )}
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
