import Link from 'next/link';
import { Plus } from 'lucide-react';

interface EmptyStateProps {
  hasFilter: boolean;
}

/**
 * Placeholder shown when no entries match the current filter / there are none yet.
 */
export default function EmptyState({ hasFilter }: EmptyStateProps) {
  return (
    <div className="rounded-2xl bg-white/50 px-6 py-16 text-center backdrop-blur-md">
      <p className="text-lg font-medium text-slate-600">No entries found</p>
      <p className="mt-1 text-sm text-slate-400">
        {hasFilter
          ? 'No entries match the selected date. Try clearing the filter.'
          : 'Start by logging your first morning routine!'}
      </p>
      {!hasFilter && (
        <Link
          href="/dashboard/entry"
          className="bg-aqua-600 hover:bg-aqua-700 mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Log Your First Entry
        </Link>
      )}
    </div>
  );
}
