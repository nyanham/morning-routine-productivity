'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { DashboardTabs } from '@/components/dashboard';
import {
  DeleteDialog,
  EmptyState,
  EntriesList,
  EntriesListSkeleton,
  EntriesToolbar,
  ErrorBanner,
} from '@/components/entries';
import { RequireAuth } from '@/contexts/AuthContext';
import { useRoutines, useProductivity } from '@/hooks/useApi';
import type { MorningRoutine, ProductivityEntry } from '@/types';

const PAGE_SIZE = 10;

/**
 * Core state and data-fetching logic for the entries page.
 *
 * Delegates all rendering to extracted components under
 * `@/components/entries`.
 */
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

  // Delete handler
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
        searchDate={searchDate}
        onSearchDateChange={(date) => {
          setSearchDate(date);
          setPage(1);
        }}
        onClearFilter={() => {
          setSearchDate('');
          setPage(1);
        }}
      />

      {hasError && (
        <ErrorBanner
          title="Error loading entries"
          message={routines.error || productivity.error || ''}
        />
      )}

      {deleteError && <ErrorBanner title="Delete failed" message={deleteError} />}

      {isLoading && <EntriesListSkeleton />}

      {isEmpty && <EmptyState hasFilter={!!searchDate} />}

      {!isLoading && entries.length > 0 && (
        <EntriesList
          entries={entries}
          productivityByDate={productivityByDate}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDelete={setDeleteTarget}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
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
