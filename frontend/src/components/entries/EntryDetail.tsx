import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import { Pencil, Trash2, X } from 'lucide-react';
import type { MorningRoutine, ProductivityEntry } from '@/types';

interface EntryDetailProps {
  routine: MorningRoutine;
  productivity?: ProductivityEntry;
  onClose: () => void;
  onDelete: () => void;
}

/**
 * Expanded detail panel for a selected routine entry.
 *
 * Displays all routine + productivity metrics in a two-section
 * card with edit / delete / close actions.
 */
export default function EntryDetail({
  routine,
  productivity,
  onClose,
  onDelete,
}: EntryDetailProps) {
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
                    const hr = parseInt(h, 10);
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
