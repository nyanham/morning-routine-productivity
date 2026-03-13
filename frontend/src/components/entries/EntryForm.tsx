import { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle,
  AlertCircle,
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

/**
 * Label with a small icon prefix — mirrors the icon layout in EntryDetail.
 */
function IconLabel({
  icon: Icon,
  htmlFor,
  children,
}: {
  icon: LucideIcon;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="label flex items-center gap-1.5">
      <Icon className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
      {children}
    </label>
  );
}

interface FormData {
  date: string;
  wake_time: string;
  sleep_duration_hours: number;
  exercise_minutes: number;
  meditation_minutes: number;
  breakfast_quality: 'poor' | 'fair' | 'good' | 'excellent';
  morning_mood: number;
  caffeine_intake: number;
  water_intake_ml: number;
  screen_time_before_bed: number;
  productivity_score: number;
  tasks_completed: number;
  tasks_planned: number;
  focus_hours: number;
  distractions_count: number;
  energy_level: number;
  stress_level: number;
  notes: string;
}

function defaultFormData(date: string): FormData {
  return {
    date,
    wake_time: '06:30',
    sleep_duration_hours: 7,
    exercise_minutes: 0,
    meditation_minutes: 0,
    breakfast_quality: 'good',
    morning_mood: 5,
    caffeine_intake: 0,
    water_intake_ml: 0,
    screen_time_before_bed: 0,
    productivity_score: 5,
    tasks_completed: 0,
    tasks_planned: 0,
    focus_hours: 0,
    distractions_count: 0,
    energy_level: 5,
    stress_level: 5,
    notes: '',
  };
}

/**
 * Merges existing routine + productivity data into the form shape.
 */
function toFormData(routine: MorningRoutine, prod?: ProductivityEntry): FormData {
  return {
    date: routine.date,
    wake_time: routine.wake_time ?? '06:30',
    sleep_duration_hours: routine.sleep_duration_hours,
    exercise_minutes: routine.exercise_minutes,
    meditation_minutes: routine.meditation_minutes,
    breakfast_quality: routine.breakfast_quality,
    morning_mood: routine.morning_mood,
    caffeine_intake: routine.caffeine_intake,
    water_intake_ml: routine.water_intake_ml,
    screen_time_before_bed: routine.screen_time_before_bed,
    productivity_score: prod?.productivity_score ?? 5,
    tasks_completed: prod?.tasks_completed ?? 0,
    tasks_planned: prod?.tasks_planned ?? 0,
    focus_hours: prod?.focus_hours ?? 0,
    distractions_count: prod?.distractions_count ?? 0,
    energy_level: prod?.energy_level ?? 5,
    stress_level: prod?.stress_level ?? 5,
    notes: prod?.notes ?? '',
  };
}

interface EntryFormProps {
  /** Pre-filled date (YYYY-MM-DD). */
  date: string;
  /** Existing routine when editing. */
  routine?: MorningRoutine;
  /** Existing productivity entry when editing. */
  productivity?: ProductivityEntry;
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
  /** Called after a successful save so the parent can refresh data. */
  onSaved: () => void;
  /** Close the form panel. */
  onClose: () => void;
}

/**
 * Inline form for creating or editing a routine + productivity entry
 * inside the detail panel of the calendar page.
 */
export default function EntryForm({
  date,
  routine,
  productivity,
  onCreateRoutine,
  onCreateProductivity,
  onUpdateRoutine,
  onUpdateProductivity,
  onSaved,
  onClose,
}: EntryFormProps) {
  const isEdit = !!routine;

  const [formData, setFormData] = useState<FormData>(
    routine ? toFormData(routine, productivity) : defaultFormData(date)
  );
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset when date / routine changes
  useEffect(() => {
    setFormData(routine ? toFormData(routine, productivity) : defaultFormData(date));
    setSuccess(false);
    setError(null);
  }, [date, routine, productivity]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) || 0 : value,
    }));
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const routinePayload = {
      date: formData.date,
      wake_time: formData.wake_time,
      sleep_duration_hours: formData.sleep_duration_hours,
      exercise_minutes: formData.exercise_minutes,
      meditation_minutes: formData.meditation_minutes,
      breakfast_quality: formData.breakfast_quality,
      morning_mood: formData.morning_mood,
      caffeine_intake: formData.caffeine_intake,
      water_intake_ml: formData.water_intake_ml,
      screen_time_before_bed: formData.screen_time_before_bed,
    };

    const productivityPayload = {
      date: formData.date,
      productivity_score: formData.productivity_score,
      tasks_completed: formData.tasks_completed,
      tasks_planned: formData.tasks_planned,
      focus_hours: formData.focus_hours,
      distractions_count: formData.distractions_count,
      energy_level: formData.energy_level,
      stress_level: formData.stress_level,
      notes: formData.notes || undefined,
    };

    try {
      if (isEdit && routine) {
        await onUpdateRoutine(routine.id, routinePayload);
        if (productivity) {
          await onUpdateProductivity(productivity.id, productivityPayload);
        } else {
          await onCreateProductivity(productivityPayload);
        }
      } else {
        await onCreateRoutine(routinePayload);
        await onCreateProductivity(productivityPayload);
      }

      setSuccess(true);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white/65 backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200/30 px-5 py-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800">
            {isEdit ? 'Edit Entry' : 'New Entry'}
          </h2>
          <p className="text-sm text-slate-500">{date}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Status banners */}
      {success && (
        <div
          role="status"
          className="mx-5 mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm"
        >
          <CheckCircle className="h-4 w-4 text-green-600" aria-hidden="true" />
          <span className="text-green-800">Entry saved!</span>
        </div>
      )}
      {error && (
        <div
          role="alert"
          className="mx-5 mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm"
        >
          <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
          <span className="text-red-800">{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5 p-5">
        {/* Morning Routine */}
        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Morning Routine
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <IconLabel icon={Clock} htmlFor="ef-wake_time">
                Wake Time
              </IconLabel>
              <input
                id="ef-wake_time"
                type="time"
                name="wake_time"
                value={formData.wake_time}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <IconLabel icon={Moon} htmlFor="ef-sleep">
                Sleep (hrs)
              </IconLabel>
              <input
                id="ef-sleep"
                type="number"
                name="sleep_duration_hours"
                value={formData.sleep_duration_hours}
                onChange={handleChange}
                step="0.5"
                min="0"
                max="24"
                className="input"
              />
            </div>
            <div>
              <IconLabel icon={Dumbbell} htmlFor="ef-exercise">
                Exercise (min)
              </IconLabel>
              <input
                id="ef-exercise"
                type="number"
                name="exercise_minutes"
                value={formData.exercise_minutes}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <IconLabel icon={Brain} htmlFor="ef-meditation">
                Meditation (min)
              </IconLabel>
              <input
                id="ef-meditation"
                type="number"
                name="meditation_minutes"
                value={formData.meditation_minutes}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <IconLabel icon={Utensils} htmlFor="ef-breakfast">
                Breakfast
              </IconLabel>
              <select
                id="ef-breakfast"
                name="breakfast_quality"
                value={formData.breakfast_quality}
                onChange={handleChange}
                className="input"
              >
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
            <div>
              <IconLabel icon={Smile} htmlFor="ef-mood">
                Mood ({formData.morning_mood}/10)
              </IconLabel>
              <input
                id="ef-mood"
                type="range"
                name="morning_mood"
                value={formData.morning_mood}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full"
              />
            </div>
            <div>
              <IconLabel icon={Coffee} htmlFor="ef-caffeine">
                Caffeine (mg)
              </IconLabel>
              <input
                id="ef-caffeine"
                type="number"
                name="caffeine_intake"
                value={formData.caffeine_intake}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <IconLabel icon={Droplets} htmlFor="ef-water">
                Water (ml)
              </IconLabel>
              <input
                id="ef-water"
                type="number"
                name="water_intake_ml"
                value={formData.water_intake_ml}
                onChange={handleChange}
                min="0"
                step="100"
                className="input"
              />
            </div>
            <div className="col-span-2">
              <IconLabel icon={Smartphone} htmlFor="ef-screen">
                Screen Before Bed (min)
              </IconLabel>
              <input
                id="ef-screen"
                type="number"
                name="screen_time_before_bed"
                value={formData.screen_time_before_bed}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
          </div>
        </fieldset>

        {/* Productivity */}
        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Productivity
          </legend>
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <IconLabel icon={Gauge} htmlFor="ef-score">
                Score ({formData.productivity_score}/10)
              </IconLabel>
              <input
                id="ef-score"
                type="range"
                name="productivity_score"
                value={formData.productivity_score}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full"
              />
            </div>
            <div>
              <IconLabel icon={ClipboardList} htmlFor="ef-tasks-planned">
                Tasks Planned
              </IconLabel>
              <input
                id="ef-tasks-planned"
                type="number"
                name="tasks_planned"
                value={formData.tasks_planned}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <IconLabel icon={CheckSquare} htmlFor="ef-tasks-done">
                Tasks Completed
              </IconLabel>
              <input
                id="ef-tasks-done"
                type="number"
                name="tasks_completed"
                value={formData.tasks_completed}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <IconLabel icon={Crosshair} htmlFor="ef-focus">
                Focus (hrs)
              </IconLabel>
              <input
                id="ef-focus"
                type="number"
                name="focus_hours"
                value={formData.focus_hours}
                onChange={handleChange}
                min="0"
                step="0.5"
                className="input"
              />
            </div>
            <div>
              <IconLabel icon={AlertTriangle} htmlFor="ef-distractions">
                Distractions
              </IconLabel>
              <input
                id="ef-distractions"
                type="number"
                name="distractions_count"
                value={formData.distractions_count}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <IconLabel icon={Zap} htmlFor="ef-energy">
                Energy ({formData.energy_level}/10)
              </IconLabel>
              <input
                id="ef-energy"
                type="range"
                name="energy_level"
                value={formData.energy_level}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full"
              />
            </div>
            <div>
              <IconLabel icon={Frown} htmlFor="ef-stress">
                Stress ({formData.stress_level}/10)
              </IconLabel>
              <input
                id="ef-stress"
                type="range"
                name="stress_level"
                value={formData.stress_level}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full"
              />
            </div>
          </div>
        </fieldset>

        {/* Notes */}
        <div>
          <IconLabel icon={FileText} htmlFor="ef-notes">
            Notes
          </IconLabel>
          <textarea
            id="ef-notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Any notes about your day..."
            className="input"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 border-t border-slate-200/30 pt-4">
          <button type="button" onClick={onClose} className="btn-secondary text-sm">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="btn-primary text-sm">
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="mr-1.5 inline h-3.5 w-3.5" aria-hidden="true" />
                {isEdit ? 'Update' : 'Save'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
