import { formatDate } from '@/lib/utils';

interface DeleteDialogProps {
  date: string;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}

/**
 * Confirmation dialog shown before permanently deleting an entry.
 *
 * Uses `role="alertdialog"` so screen readers announce it immediately.
 */
export default function DeleteDialog({ date, onConfirm, onCancel, deleting }: DeleteDialogProps) {
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
