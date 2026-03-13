import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { cn, formatDate } from '@/lib/utils';
import { getHolidays } from '@/lib/holidays';
import { ChevronLeft, ChevronRight, Plus, Upload, Calendar } from 'lucide-react';
import type { MorningRoutine, ProductivityEntry } from '@/types';

import EntryDetail from './EntryDetail';
import EntryForm from './EntryForm';

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
  /** Currently selected entry id (view / edit). */
  selectedId: string | null;
  /** Select or deselect an entry. */
  onSelect: (id: string | null) => void;
  /** Request deletion for an entry. */
  onDelete: (routine: MorningRoutine) => void;
  /** Currently selected empty date (for "add" mode). */
  selectedDate: string | null;
  /** Select an empty date to add an entry. */
  onSelectDate: (date: string | null) => void;
  /** Whether the detail panel is in edit mode. */
  editMode: boolean;
  /** Toggle between view and edit. */
  onEditModeChange: (editing: boolean) => void;
  /** User locale for holiday detection (e.g. 'en-US'). */
  locale?: string;
  /** CRUD callbacks for inline forms. */
  onCreateRoutine: (
    data: Omit<MorningRoutine, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<MorningRoutine>;
  onCreateProductivity: (
    data: Omit<ProductivityEntry, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ) => Promise<ProductivityEntry>;
  onUpdateRoutine: (id: string, data: Partial<MorningRoutine>) => Promise<MorningRoutine>;
  onUpdateProductivity: (
    id: string,
    data: Partial<ProductivityEntry>
  ) => Promise<ProductivityEntry>;
  /** Called after a successful create/update so the parent can refresh. */
  onSaved: () => void;
  /** Whether entries are being fetched (for visual feedback). */
  loading?: boolean;
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
 * Maps a productivity score (1-10) to a single teal/primary palette.
 *
 * Lighter shades for low scores, darker for high — a cohesive
 * gradient that reads as "more colour = more productive".
 */
function scoreColors(score: number): string {
  if (score <= 2) return 'bg-primary-100/80 text-primary-800';
  if (score <= 4) return 'bg-primary-200/80 text-primary-800';
  if (score <= 6) return 'bg-primary-400/70 text-primary-900';
  if (score <= 8) return 'bg-primary-600/80 text-white';
  return 'bg-primary-800/90 text-white';
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
  selectedDate,
  onSelectDate,
  editMode,
  onEditModeChange,
  locale,
  onCreateRoutine,
  onCreateProductivity,
  onUpdateRoutine,
  onUpdateProductivity,
  onSaved,
  loading,
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

  /* ---- holidays for this month ---- */
  const holidays = useMemo(() => getHolidays(year, locale), [year, locale]);

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
    <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-5">
      {/* Calendar grid — always takes 3 columns */}
      <div className="lg:col-span-3">
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
        <div
          role="grid"
          aria-label={`Calendar for ${monthLabel}`}
          className={cn('space-y-1', loading && 'opacity-50 transition-opacity')}
        >
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
                const isDateSelected = dateStr === selectedDate;
                const isToday = String(day) === todayStr;
                const dow = new Date(year, month, day).getDay();
                const isWeekend = dow === 0 || dow === 6;
                const isHoliday = holidays.has(dateStr);

                /* Day WITH an entry — show detail on click */
                if (hasEntry) {
                  return (
                    <div key={dateStr} role="gridcell">
                      <button
                        type="button"
                        aria-label={`${formatDate(dateStr)}${score ? `, productivity ${score} out of 10` : ''}${isWeekend ? ', weekend' : ''}${isHoliday ? ', holiday' : ''}`}
                        aria-pressed={isSelected ? 'true' : 'false'}
                        onClick={() => {
                          onSelectDate(null);
                          onEditModeChange(false);
                          onSelect(routine.id === selectedId ? null : routine.id);
                        }}
                        className={cn(
                          'group relative flex aspect-square w-full items-center justify-center rounded-lg text-xs font-medium transition-all duration-150',
                          'cursor-pointer hover:z-10 hover:scale-110 hover:shadow-md',
                          score
                            ? scoreColors(score)
                            : 'border border-dashed border-slate-300 bg-slate-50/50 text-slate-500',
                          isToday && 'ring-aqua-600 ring-2',
                          isSelected && 'ring-aqua-400 ring-2 ring-offset-2'
                        )}
                      >
                        <span
                          className={cn(
                            'text-xs font-semibold',
                            isHoliday ? 'text-accent-500' : isWeekend ? 'text-red-400' : ''
                          )}
                        >
                          {day}
                        </span>
                        {score != null && (
                          <span className="absolute inset-x-0 bottom-0.5 text-center text-[9px] leading-none opacity-0 transition-opacity group-hover:opacity-80">
                            {score}/10
                          </span>
                        )}
                      </button>
                    </div>
                  );
                }

                /* Day WITHOUT an entry — button to add inline */
                return (
                  <div key={dateStr} role="gridcell">
                    <button
                      type="button"
                      aria-label={`${formatDate(dateStr)}, add entry${isWeekend ? ', weekend' : ''}${isHoliday ? ', holiday' : ''}`}
                      onClick={() => {
                        onSelect(null);
                        onEditModeChange(false);
                        onSelectDate(dateStr === selectedDate ? null : dateStr);
                      }}
                      className={cn(
                        'group relative flex aspect-square w-full items-center justify-center rounded-lg text-xs font-medium transition-all duration-150',
                        'bg-slate-50/40 text-slate-400 hover:bg-slate-100/60 hover:text-slate-600',
                        isToday && 'ring-aqua-600 text-aqua-600 ring-2',
                        isDateSelected && 'ring-aqua-400 ring-2 ring-offset-2'
                      )}
                    >
                      <span
                        className={cn(
                          'text-xs font-medium',
                          isHoliday ? 'text-accent-500' : isWeekend ? 'text-red-400' : ''
                        )}
                      >
                        {day}
                      </span>
                      <Plus
                        className="absolute bottom-0.5 h-2.5 w-2.5 opacity-0 transition-opacity group-hover:opacity-60"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Hint for an empty month */}
        {entries.length === 0 && (
          <p className="mt-3 text-center text-sm text-slate-400">
            Click any day to log your first entry.
          </p>
        )}
      </div>

      {/* Detail panel — always visible, fixed height with internal scroll */}
      <div className="min-h-[24rem] lg:sticky lg:top-24 lg:col-span-2 lg:h-[calc(100vh-8rem)] lg:self-start">
        {/* Edit mode: inline form for an existing entry */}
        {editMode && selectedRoutine && (
          <div className="h-full overflow-y-auto">
            <EntryForm
              date={selectedRoutine.date}
              routine={selectedRoutine}
              productivity={selectedProductivity}
              onCreateRoutine={onCreateRoutine}
              onCreateProductivity={onCreateProductivity}
              onUpdateRoutine={onUpdateRoutine}
              onUpdateProductivity={onUpdateProductivity}
              onSaved={onSaved}
              onClose={() => onEditModeChange(false)}
            />
          </div>
        )}

        {/* View mode: read-only detail */}
        {!editMode && selectedRoutine && (
          <div className="h-full overflow-y-auto">
            <EntryDetail
              routine={selectedRoutine}
              productivity={selectedProductivity}
              onClose={() => onSelect(null)}
              onDelete={() => onDelete(selectedRoutine)}
              onEdit={() => onEditModeChange(true)}
            />
          </div>
        )}

        {/* Add mode: inline form for an empty date */}
        {!selectedRoutine && selectedDate && (
          <div className="h-full overflow-y-auto">
            <EntryForm
              date={selectedDate}
              onCreateRoutine={onCreateRoutine}
              onCreateProductivity={onCreateProductivity}
              onUpdateRoutine={onUpdateRoutine}
              onUpdateProductivity={onUpdateProductivity}
              onSaved={onSaved}
              onClose={() => onSelectDate(null)}
            />
          </div>
        )}

        {/* Nothing selected: placeholder banner */}
        {!selectedRoutine && !selectedDate && (
          <div className="from-primary-50/80 to-accent-50/60 relative flex h-full flex-col items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br via-white/70 px-6 py-16 text-center backdrop-blur-md">
            {/* Decorative background circles */}
            <div
              className="bg-primary-200/30 pointer-events-none absolute -top-10 -right-10 h-40 w-40 rounded-full"
              aria-hidden="true"
            />
            <div
              className="bg-accent-100/30 pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full"
              aria-hidden="true"
            />
            <div
              className="bg-primary-100/20 pointer-events-none absolute top-1/2 left-1/2 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full"
              aria-hidden="true"
            />
            <Calendar className="text-primary-300 relative mb-4 h-12 w-12" aria-hidden="true" />
            <h2 className="relative text-lg font-semibold text-slate-700">No day selected</h2>
            <p className="relative mt-2 max-w-xs text-sm text-slate-500">
              Pick a day on the calendar to view your entry or add a new one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
