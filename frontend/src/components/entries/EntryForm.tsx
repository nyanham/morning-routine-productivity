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

/**
 * Borderless inline input classes matching EntryDetail's plain-text Metric values.
 * A dotted underline signals editability; solid accent underline on focus.
 */
const INPUT_CLS =
  'ml-auto bg-transparent px-0 py-0 text-right text-sm font-medium text-slate-800 outline-none border-b border-dotted border-slate-300 focus:border-solid focus:border-primary-400';

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
    <div className="flex min-h-full flex-col rounded-2xl bg-white/65 backdrop-blur-md">
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
          <X className="h-4 w-4" aria-hidden="true" />
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

      {/* Form — compact inline rows matching EntryDetail's Metric layout */}
      <form onSubmit={handleSubmit} className="flex-1 space-y-4 p-5">
        {/* Morning Routine */}
        <fieldset>
          <legend className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Morning Routine
          </legend>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="ef-wake_time" className="text-slate-500">
                Wake
              </label>
              <input
                id="ef-wake_time"
                type="time"
                name="wake_time"
                value={formData.wake_time}
                onChange={handleChange}
                className={`${INPUT_CLS} w-24`}
              />
            </div>
            <div className="flex items-center gap-2">
              <Moon className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="ef-sleep" className="text-slate-500">
                Sleep
              </label>
              <input
                id="ef-sleep"
                type="number"
                name="sleep_duration_hours"
                value={formData.sleep_duration_hours}
                onChange={handleChange}
                step="0.5"
                min="0"
                max="24"
                className={`${INPUT_CLS} w-14`}
              />
              <span className="text-xs text-slate-400">h</span>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="ef-exercise" className="text-slate-500">
                Exercise
              </label>
              <input
                id="ef-exercise"
                type="number"
                name="exercise_minutes"
                value={formData.exercise_minutes}
                onChange={handleChange}
                min="0"
                className={`${INPUT_CLS} w-14`}
              />
              <span className="text-xs text-slate-400">min</span>
            </div>
            <div className="flex items-center gap-2">
              <Brain className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="ef-meditation" className="text-slate-500">
                Meditate
              </label>
              <input
                id="ef-meditation"
                type="number"
                name="meditation_minutes"
                value={formData.meditation_minutes}
                onChange={handleChange}
                min="0"
                className={`${INPUT_CLS} w-14`}
              />
              <span className="text-xs text-slate-400">min</span>
            </div>
            <div className="flex items-center gap-2">
              <Utensils className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="ef-breakfast" className="text-slate-500">
                Breakfast
              </label>
              <select
                id="ef-breakfast"
                name="breakfast_quality"
                value={formData.breakfast_quality}
                onChange={handleChange}
                className={`${INPUT_CLS} w-24`}
              >
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Smile className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="ef-mood" className="text-slate-500">
                Mood
              </label>
              <input
                id="ef-mood"
                type="range"
                name="morning_mood"
                value={formData.morning_mood}
                onChange={handleChange}
                min="1"
                max="10"
                className="ml-auto w-16"
              />
              <span className="w-8 text-right font-medium text-slate-800">
                {formData.morning_mood}/10
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Coffee className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="ef-caffeine" className="text-slate-500">
                Caffeine
              </label>
              <input
                id="ef-caffeine"
                type="number"
                name="caffeine_intake"
                value={formData.caffeine_intake}
                onChange={handleChange}
                min="0"
                className={`${INPUT_CLS} w-14`}
              />
              <span className="text-xs text-slate-400">mg</span>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="ef-water" className="text-slate-500">
                Water
              </label>
              <input
                id="ef-water"
                type="number"
                name="water_intake_ml"
                value={formData.water_intake_ml}
                onChange={handleChange}
                min="0"
                step="100"
                className={`${INPUT_CLS} w-16`}
              />
              <span className="text-xs text-slate-400">ml</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <label htmlFor="ef-screen" className="text-slate-500">
                Screen
              </label>
              <input
                id="ef-screen"
                type="number"
                name="screen_time_before_bed"
                value={formData.screen_time_before_bed}
                onChange={handleChange}
                min="0"
                className={`${INPUT_CLS} w-14`}
              />
              <span className="text-xs text-slate-400">min</span>
            </div>
          </div>
        </fieldset>

        {/* Productivity */}
        <div className="border-t border-slate-200/30 pt-5">
          <fieldset>
            <legend className="mb-3 text-xs font-semibold tracking-wider text-slate-400 uppercase">
              Productivity
            </legend>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
              <div className="flex items-center gap-2">
                <Gauge className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <label htmlFor="ef-score" className="text-slate-500">
                  Score
                </label>
                <input
                  id="ef-score"
                  type="range"
                  name="productivity_score"
                  value={formData.productivity_score}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="ml-auto w-16"
                />
                <span className="w-8 text-right font-medium text-slate-800">
                  {formData.productivity_score}/10
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardList className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <label htmlFor="ef-tasks-planned" className="text-slate-500">
                  Planned
                </label>
                <input
                  id="ef-tasks-planned"
                  type="number"
                  name="tasks_planned"
                  value={formData.tasks_planned}
                  onChange={handleChange}
                  min="0"
                  className={`${INPUT_CLS} w-14`}
                />
              </div>
              <div className="flex items-center gap-2">
                <CheckSquare className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <label htmlFor="ef-tasks-done" className="text-slate-500">
                  Done
                </label>
                <input
                  id="ef-tasks-done"
                  type="number"
                  name="tasks_completed"
                  value={formData.tasks_completed}
                  onChange={handleChange}
                  min="0"
                  className={`${INPUT_CLS} w-14`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Crosshair className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <label htmlFor="ef-focus" className="text-slate-500">
                  Focus
                </label>
                <input
                  id="ef-focus"
                  type="number"
                  name="focus_hours"
                  value={formData.focus_hours}
                  onChange={handleChange}
                  min="0"
                  step="0.5"
                  className={`${INPUT_CLS} w-14`}
                />
                <span className="text-xs text-slate-400">h</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <label htmlFor="ef-distractions" className="text-slate-500">
                  Distractions
                </label>
                <input
                  id="ef-distractions"
                  type="number"
                  name="distractions_count"
                  value={formData.distractions_count}
                  onChange={handleChange}
                  min="0"
                  className={`${INPUT_CLS} w-14`}
                />
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <label htmlFor="ef-energy" className="text-slate-500">
                  Energy
                </label>
                <input
                  id="ef-energy"
                  type="range"
                  name="energy_level"
                  value={formData.energy_level}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="ml-auto w-16"
                />
                <span className="w-8 text-right font-medium text-slate-800">
                  {formData.energy_level}/10
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Frown className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <label htmlFor="ef-stress" className="text-slate-500">
                  Stress
                </label>
                <input
                  id="ef-stress"
                  type="range"
                  name="stress_level"
                  value={formData.stress_level}
                  onChange={handleChange}
                  min="1"
                  max="10"
                  className="ml-auto w-16"
                />
                <span className="w-8 text-right font-medium text-slate-800">
                  {formData.stress_level}/10
                </span>
              </div>
            </div>
          </fieldset>

          {/* Notes — positioned inside Productivity, matching EntryDetail */}
          <div className="mt-3 flex items-start gap-2 text-sm">
            <FileText className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
            <div className="flex-1">
              <label htmlFor="ef-notes" className="mb-1 block text-slate-500">
                Notes
              </label>
              <textarea
                id="ef-notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                placeholder="Any notes about your day..."
                className="focus:border-primary-400 w-full resize-none border-b border-dotted border-slate-300 bg-transparent p-1 text-sm text-slate-700 outline-none focus:border-solid"
              />
            </div>
          </div>
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
