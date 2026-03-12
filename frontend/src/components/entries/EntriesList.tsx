import { RoutineEntryPanel } from '@/components/dashboard';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { MorningRoutine, ProductivityEntry } from '@/types';

import EntryDetail from './EntryDetail';

interface EntriesListProps {
  entries: MorningRoutine[];
  productivityByDate: Map<string, ProductivityEntry>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDelete: (routine: MorningRoutine) => void;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Renders the paginated entries list with an optional side-by-side detail panel.
 */
export default function EntriesList({
  entries,
  productivityByDate,
  selectedId,
  onSelect,
  onDelete,
  page,
  totalPages,
  onPageChange,
}: EntriesListProps) {
  const selectedRoutine = entries.find((r) => r.id === selectedId) ?? null;
  const selectedProductivity = selectedRoutine
    ? productivityByDate.get(selectedRoutine.date)
    : undefined;

  return (
    <>
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
                onClick={() => onSelect(routine.id === selectedId ? null : routine.id)}
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
              onClose={() => onSelect(null)}
              onDelete={() => onDelete(selectedRoutine)}
              onEdit={() => {}}
            />
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2" aria-label="Entries pagination">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
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
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-white/50 disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>
      )}
    </>
  );
}
