import { formatDate } from '@/lib/utils';
import {
  Pencil,
  Trash2,
  X,
  Clock,
  Moon,
  Dumbbell,
  Brain,
  Utensils,
  Smile,
  Coffee,
  Droplets,
  Smartphone,
  Gauge,
  ClipboardList,
  CheckSquare,
  Crosshair,
  AlertTriangle,
  Zap,
  Frown,
  FileText,
} from 'lucide-react';
import type { MorningRoutine, ProductivityEntry } from '@/types';
import type { LucideIcon } from 'lucide-react';

interface EntryDetailProps {
  routine: MorningRoutine;
  productivity?: ProductivityEntry;
  onClose: () => void;
  onDelete: () => void;
  /** Switch to inline edit mode. */
  onEdit: () => void;
}

/**
 * Compact metric row used inside the detail panel.
 * Matches the two-column grid of EntryForm for positional consistency.
 */
function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
      <dt className="text-slate-500">{label}</dt>
      <dd className="ml-auto font-medium text-slate-800">{value}</dd>
    </div>
  );
}

/**
 * Minimalist detail panel for a selected routine entry.
 *
 * Uses small icons for each metric in the same order as EntryForm
 * so view ↔ edit transitions feel seamless.
 */
export default function EntryDetail({
  routine,
  productivity,
  onClose,
  onDelete,
  onEdit,
}: EntryDetailProps) {
  const dateFormatted = formatDate(routine.date);

  const breakfastLabel: Record<string, string> = {
    poor: 'Poor',
    fair: 'Fair',
    good: 'Good',
    excellent: 'Excellent',
  };

  const wakeFormatted = routine.wake_time
    ? (() => {
        const [h, m] = routine.wake_time.split(':');
        const hr = parseInt(h, 10);
        return `${hr % 12 || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`;
      })()
    : '—';

  return (
    <div className="rounded-2xl bg-white/65 backdrop-blur-md">
      {/* Header — matches EntryForm header structure */}
      <div className="flex items-center justify-between border-b border-slate-200/30 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">{dateFormatted}</h2>
          <p className="text-sm text-slate-500">Entry details</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onEdit}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            title="Edit entry"
          >
            <Pencil className="h-4 w-4" />
          </button>
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

      {/* Body — same padding and spacing as EntryForm */}
      <div className="space-y-5 p-5">
        {/* Morning Routine — field order matches EntryForm */}
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Morning Routine
          </h3>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            <Metric icon={Clock} label="Wake" value={wakeFormatted} />
            <Metric icon={Moon} label="Sleep" value={`${routine.sleep_duration_hours} h`} />
            <Metric icon={Dumbbell} label="Exercise" value={`${routine.exercise_minutes} min`} />
            <Metric icon={Brain} label="Meditate" value={`${routine.meditation_minutes} min`} />
            <Metric
              icon={Utensils}
              label="Breakfast"
              value={breakfastLabel[routine.breakfast_quality] ?? routine.breakfast_quality}
            />
            <Metric icon={Smile} label="Mood" value={`${routine.morning_mood}/10`} />
            <Metric icon={Coffee} label="Caffeine" value={`${routine.caffeine_intake} mg`} />
            <Metric icon={Droplets} label="Water" value={`${routine.water_intake_ml} ml`} />
            <div className="col-span-2">
              <Metric
                icon={Smartphone}
                label="Screen"
                value={`${routine.screen_time_before_bed} min`}
              />
            </div>
          </dl>
        </div>

        {/* Productivity — field order matches EntryForm */}
        {productivity && (
          <div className="border-t border-slate-200/30 pt-5">
            <h3 className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Productivity
            </h3>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              <div className="col-span-2">
                <Metric
                  icon={Gauge}
                  label="Score"
                  value={`${productivity.productivity_score}/10`}
                />
              </div>
              <Metric icon={ClipboardList} label="Planned" value={productivity.tasks_planned} />
              <Metric icon={CheckSquare} label="Done" value={productivity.tasks_completed} />
              <Metric icon={Crosshair} label="Focus" value={`${productivity.focus_hours} h`} />
              <Metric
                icon={AlertTriangle}
                label="Distractions"
                value={productivity.distractions_count}
              />
              <Metric icon={Zap} label="Energy" value={`${productivity.energy_level}/10`} />
              <Metric icon={Frown} label="Stress" value={`${productivity.stress_level}/10`} />
            </dl>
            {productivity.notes && (
              <div className="mt-3 flex items-start gap-2 text-sm">
                <FileText
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                  aria-hidden="true"
                />
                <p className="rounded-lg bg-slate-50/60 p-2 text-slate-700">{productivity.notes}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
