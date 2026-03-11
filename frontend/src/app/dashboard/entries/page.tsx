'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardTabs } from '@/components/dashboard';
import {
  CalendarSkeleton,
  DeleteDialog,
  EmptyState,
  EntriesCalendar,
  EntriesToolbar,
  ErrorBanner,
} from '@/components/entries';
import { RequireAuth } from '@/contexts/AuthContext';
import { useRoutines, useProductivity } from '@/hooks/useApi';
import type { MorningRoutine, ProductivityEntry } from '@/types';

/** Fetch all entries for the visible month (generous page size). */
const MONTH_PAGE_SIZE = 100;

/**
 * Returns the start and end date strings (YYYY-MM-DD) for a given
 * year / month, suitable for the API date-range params.
 */
function monthRange(year: number, month: number) {
  const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { startDate, endDate };
}

/**
 * Core state and data-fetching logic for the entries page.
 *
 * Delegates all rendering to extracted components under
 * `@/components/entries`. Uses a monthly calendar view
 * where day colours reflect the productivity score.
 */
function EntriesContent() {
  const routines = useRoutines();
  const productivity = useProductivity();

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MorningRoutine | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { fetch: fetchRoutines } = routines;
  const { fetch: fetchProductivity } = productivity;

  const loadEntries = useCallback(() => {
    const { startDate, endDate } = monthRange(year, month);
    const params = { page: 1, pageSize: MONTH_PAGE_SIZE, startDate, endDate };
    fetchRoutines(params);
    fetchProductivity(params);
  }, [year, month, fetchRoutines, fetchProductivity]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  /* ---- derived data ---- */
  const entries = routines.data?.data ?? [];

  const productivityByDate = useMemo(
    () => new Map(productivity.data?.data?.map((p: ProductivityEntry) => [p.date, p]) ?? []),
    [productivity.data]
  );

  const isLoading = routines.loading || productivity.loading;
  const hasError = routines.error || productivity.error;
  const isEmpty = !isLoading && entries.length === 0 && !hasError;

  /* ---- month navigation ---- */
  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear);
    setMonth(newMonth);
    setSelectedId(null);
  };

  /* ---- delete handler ---- */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);

    try {
      await routines.remove(deleteTarget.id);

      const linkedProd = productivityByDate.get(deleteTarget.date);
      if (linkedProd) {
        await productivity.remove(linkedProd.id);
      }

      if (selectedId === deleteTarget.id) setSelectedId(null);
      setDeleteTarget(null);
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

      <EntriesToolbar
        searchDate=""
        onSearchDateChange={(date) => {
          if (!date) return;
          const d = new Date(date + 'T00:00:00');
          handleMonthChange(d.getFullYear(), d.getMonth());
        }}
        onClearFilter={() => {
          const today = new Date();
          handleMonthChange(today.getFullYear(), today.getMonth());
        }}
      />

      {hasError && (
        <ErrorBanner
          title="Error loading entries"
          message={routines.error || productivity.error || ''}
        />
      )}

      {deleteError && <ErrorBanner title="Delete failed" message={deleteError} />}

      {isLoading && <CalendarSkeleton />}

      {isEmpty && <EmptyState hasFilter={false} />}

      {!isLoading && entries.length > 0 && (
        <EntriesCalendar
          entries={entries}
          productivityByDate={productivityByDate}
          year={year}
          month={month}
          onMonthChange={handleMonthChange}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={setDeleteTarget}
        />
      )}

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
 * My Entries page — calendar view of routine entries where day
 * colours reflect the productivity score, with an inline detail
 * panel and delete confirmation.
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
