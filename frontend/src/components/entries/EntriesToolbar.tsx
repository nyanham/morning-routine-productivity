import Link from 'next/link';
import { Plus, Upload, Search } from 'lucide-react';

interface EntriesToolbarProps {
  searchDate: string;
  onSearchDateChange: (date: string) => void;
  onClearFilter: () => void;
}

/**
 * Toolbar above the entries list: date filter input + Import / New Entry actions.
 */
export default function EntriesToolbar({
  searchDate,
  onSearchDateChange,
  onClearFilter,
}: EntriesToolbarProps) {
  return (
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
          onChange={(e) => onSearchDateChange(e.target.value)}
          className="input pl-9"
          aria-label="Filter by date"
        />
      </div>

      {searchDate && (
        <button
          type="button"
          onClick={onClearFilter}
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
  );
}
