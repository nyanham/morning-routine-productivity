'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardTabs, RoutineEntryPanel } from '@/components/dashboard';
import { RequireAuth } from '@/contexts/AuthContext';
import { useRoutines, useProductivity } from '@/hooks/useApi';
import { cn, formatDate } from '@/lib/utils';
import {
  Plus,
  Upload,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Pencil,
  X,
} from 'lucide-react';
import type { MorningRoutine, ProductivityEntry } from '@/types';

// ── Constants ──

const PAGE_SIZE = 10;

// ── Skeleton ──

function EntriesListSkeleton() {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">Loading entries…</span>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-xl bg-white/50 px-5 py-4 backdrop-blur-md"
          aria-hidden="true"
        >
          <div className="h-5 w-5 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-slate-200" />
            <div className="h-3 w-20 rounded bg-slate-200" />
          </div>
          <div className="h-6 w-16 rounded-full bg-slate-200" />
          <div className="h-5 w-5 rounded bg-slate-200" />
        </div>
      ))}
    </div>
  );
}

// ── Delete confirmation dialog ──

interface DeleteDialogProps {
  date: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}

function DeleteDialog({ date, onConfirm, onCancel, deleting }: DeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      role="alertdialog"
      aria-labelledby="delete-title"
      aria-describedby="delete-desc"
    >
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 id="delete-title" className="text-lg font-bold text-slate-800">
          Delete entry?
        </h2>
        <p id="delete-desc" className="mt-2 text-sm text-slate-600">
          This will permanently delete the routine {date ? `for ${formatDate(date)}` : ''} and its
          linked productivity entry. This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Entry detail panel ──

interface EntryDetailProps {
  routine: MorningRoutine;
  productivity?: ProductivityEntry;
  onClose: () => void;
  onDelete: () => void;
}

function EntryDetail({ routine, productivity, onClose, onDelete }: EntryDetailProps) {
  const dateFormatted = formatDate(routine.date);

  const breakfastLabel: Record<string, string> = {
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',
  };

  return (
    <div className="rounded-2xl bg-white/65 p-6 backdrop-blur-md">
      {/* Header */}
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">{dateFormatted}</h2>
          <p className="mt-0.5 text-sm text-slate-500">Entry details</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/entries/${routine.id}/edit`}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Edit entry"
          >
            <Pencil className="h-4 w-4" />
          </Link>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
            title="Delete entry"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close detail"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Routine metrics */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
          Morning Routine
        </h3>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-slate-500">Wake Time</dt>
            <dd className="font-medium text-slate-800">
              {routine.wake_time
                ? (() => {
                    const [h, m] = routine.wake_time.split(':');
                    const hr = parseInt(h);
                    return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
                  })()
                : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Sleep</dt>
            <dd className="font-medium text-slate-800">{routine.sleep_duration_hours} hrs</dd>
          </div>
          <div>
            <dt className="text-slate-500">Morning Mood</dt>
            <dd className="font-medium text-slate-800">{routine.morning_mood}/10</dd>
          </div>
          <div>
            <dt className="text-slate-500">Exercise</dt>
            <dd className="font-medium text-slate-800">{routine.exercise_minutes} min</dd>
          </div>
          <div>
            <dt className="text-slate-500">Meditation</dt>
            <dd className="font-medium text-slate-800">{routine.meditation_minutes} min</dd>
          </div>
          <div>
            <dt className="text-slate-500">Breakfast</dt>
            <dd className="font-medium text-slate-800 capitalize">
              {breakfastLabel[routine.breakfast_quality] ?? routine.breakfast_quality}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">Caffeine</dt>
            <dd className="font-medium text-slate-800">{routine.caffeine_intake} mg</dd>
          </div>
          <div>
            <dt className="text-slate-500">Water</dt>
            <dd className="font-medium text-slate-800">{routine.water_intake_ml} ml</dd>
          </div>
          <div>
            <dt className="text-slate-500">Screen Before Bed</dt>
            <dd className="font-medium text-slate-800">{routine.screen_time_before_bed} min</dd>
          </div>
        </dl>
      </div>

      {/* Productivity metrics */}
      {productivity && (
        <div className="mt-6 space-y-4 border-t border-slate-200/30 pt-5">
          <h3 className="text-sm font-semibold tracking-wider text-slate-400 uppercase">
            Productivity
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Score</dt>
              <dd className="font-medium text-slate-800">{productivity.productivity_score}/10</dd>
            </div>
            <div>
              <dt className="text-slate-500">Energy</dt>
              <dd className="font-medium text-slate-800">{productivity.energy_level}/10</dd>
            </div>
            <div>
              <dt className="text-slate-500">Stress</dt>
              <dd className="font-medium text-slate-800">{productivity.stress_level}/10</dd>
            </div>
            <div>
              <dt className="text-slate-500">Tasks</dt>
              <dd className="font-medium text-slate-800">
                {productivity.tasks_completed}/{productivity.tasks_planned}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Focus</dt>
              <dd className="font-medium text-slate-800">{productivity.focus_hours} hrs</dd>
            </div>
            <div>
              <dt className="text-slate-500">Distractions</dt>
              <dd className="font-medium text-slate-800">{productivity.distractions_count}</dd>
            </div>
          </dl>
          {productivity.notes && (
            <div className="mt-3">
              <dt className="text-sm text-slate-500">Notes</dt>
              <dd className="mt-1 rounded-lg bg-slate-50/60 p-3 text-sm text-slate-700">
                {productivity.notes}
              </dd>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main entries content ──

function EntriesContent() {
  const routines = useRoutines();
  const productivity = useProductivity();

  const [page, setPage] = useState(1);
  const [searchDate, setSearchDate] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MorningRoutine | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { fetch: fetchRoutines } = routines;
  const { fetch: fetchProductivity } = productivity;

  // Fetch entries on mount and on page / search change
  const loadEntries = useCallback(() => {
    const params: { page?: number; pageSize?: number; startDate?: string; endDate?: string } = {
      page,
      pageSize: PAGE_SIZE,
    };
    if (searchDate) {
      params.startDate = searchDate;
      params.endDate = searchDate;
    }
    fetchRoutines(params);
    fetchProductivity(params);
  }, [page, searchDate, fetchRoutines, fetchProductivity]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Derived data
  const entries = routines.data?.data ?? [];
  const totalPages = routines.data?.total_pages ?? 1;

  const productivityByDate = useMemo(
    () => new Map(productivity.data?.data?.map((p: ProductivityEntry) => [p.date, p]) ?? []),
    [productivity.data]
  );

  const isLoading = routines.loading || productivity.loading;
  const hasError = routines.error || productivity.error;
  const isEmpty = !isLoading && entries.length === 0 && !hasError;

  const selectedRoutine = entries.find((r) => r.id === selectedId) ?? null;
  const selectedProductivity = selectedRoutine
    ? productivityByDate.get(selectedRoutine.date)
    : undefined;

  // Delete handler
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      // Delete routine
      await routines.remove(deleteTarget.id);

      // Also delete linked productivity entry if it exists
      const linkedProd = productivityByDate.get(deleteTarget.date);
      if (linkedProd) {
        await productivity.remove(linkedProd.id);
      }

      // Close detail if this entry was selected
      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);

      // Reload
      loadEntries();
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete entry');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      <DashboardTabs />

      {/* Toolbar: search + actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Date search */}
        <div className="relative flex-1 sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="date"
            value={searchDate}
            onChange={(e) => {
              setSearchDate(e.target.value);
              setPage(1);
            }}
            className="input pl-9"
            aria-label="Filter by date"
          />
        </div>

        {searchDate && (
          <button
            type="button"
            onClick={() => {
              setSearchDate('');
              setPage(1);
            }}
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-200"
          >
            Clear filter
          </button>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/dashboard/import"
            className="inline-flex items-center gap-2 rounded-xl bg-white/50 px-4 py-2.5 text-sm font-medium text-slate-600 backdrop-blur-md transition-colors hover:bg-white/70"
          >
            <Upload className="h-4 w-4" aria-hidden="true" />
            Import CSV
          </Link>
          <Link
            href="/dashboard/entry"
            className="bg-aqua-600 hover:bg-aqua-700 focus-visible:ring-aqua-400 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            New Entry
          </Link>
        </div>
      </div>

      {/* Error banner */}
      {hasError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50/60 p-4 backdrop-blur-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="text-sm text-red-800">
            <p className="font-medium">Error loading entries</p>
            <p>{routines.error || productivity.error}</p>
          </div>
        </div>
      )}

      {deleteError && (
        <div className="flex items-start gap-3 rounded-xl bg-red-50/60 p-4 backdrop-blur-sm">
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <div className="text-sm text-red-800">
            <p className="font-medium">Delete failed</p>
            <p>{deleteError}</p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && <EntriesListSkeleton />}

      {/* Empty state */}
      {isEmpty && (
        <div className="rounded-2xl bg-white/50 px-6 py-16 text-center backdrop-blur-md">
          <p className="text-lg font-medium text-slate-600">No entries found</p>
          <p className="mt-1 text-sm text-slate-400">
            {searchDate
              ? 'No entries match the selected date. Try clearing the filter.'
              : 'Start by logging your first morning routine!'}
          </p>
          {!searchDate && (
            <Link
              href="/dashboard/entry"
              className="bg-aqua-600 hover:bg-aqua-700 mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Log Your First Entry
            </Link>
          )}
        </div>
      )}

      {/* Entries list + detail layout */}
      {!isLoading && entries.length > 0 && (
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          {/* Entry list */}
          <div className={cn('space-y-2', selectedId ? 'lg:col-span-2' : 'lg:col-span-5')}>
            {entries
              .slice()
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((routine) => (
                <button
                  key={routine.id}
                  type="button"
                  onClick={() => setSelectedId(routine.id === selectedId ? null : routine.id)}
                  className={cn(
                    'w-full text-left transition-all',
                    routine.id === selectedId && 'ring-aqua-400 rounded-xl ring-2'
                  )}
                >
                  <RoutineEntryPanel
                    routine={routine}
                    productivity={productivityByDate.get(routine.date)}
                    defaultExpanded={false}
                  />
                </button>
              ))}
          </div>

          {/* Detail panel (slides in on select) */}
          {selectedRoutine && (
            <div className="lg:sticky lg:top-24 lg:col-span-3 lg:self-start">
              <EntryDetail
                routine={selectedRoutine}
                productivity={selectedProductivity}
                onClose={() => setSelectedId(null)}
                onDelete={() => setDeleteTarget(selectedRoutine)}
              />
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Entries pagination">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/50 disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <span className="px-3 text-sm text-slate-600">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/50 disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <DeleteDialog
          date={deleteTarget.date}
          onConfirm={handleDelete}
          onCancel={() => {
            setDeleteTarget(null);
            setDeleteError(null);
          }}
          deleting={deleting}
        />
      )}
    </div>
  );
}

/**
 * My Entries page — paginated list of routine entries with
 * inline detail panel, date filtering, and delete confirmation.
 */
export default function EntriesPage() {
  return (
    <RequireAuth>
      <DashboardLayout title="My Entries">
        <EntriesContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
