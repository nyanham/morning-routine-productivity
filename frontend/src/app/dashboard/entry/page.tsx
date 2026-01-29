'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/contexts/AuthContext';
import { useRoutines, useProductivity } from '@/hooks/useApi';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

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

const initialFormData: FormData = {
  date: new Date().toISOString().split('T')[0],
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

function ManualEntryContent() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const routines = useRoutines();
  const productivity = useProductivity();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' || type === 'range' ? parseFloat(value) || 0 : value,
    }));
    // Clear success/error on change
    setSuccess(false);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Create routine entry
      const routineData = {
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

      // Create productivity entry
      const productivityData = {
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

      // Submit both
      await Promise.all([routines.create(routineData), productivity.create(productivityData)]);

      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        setFormData(initialFormData);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Manual Entry</h1>
        <p className="mt-1 text-slate-600">
          Log your morning routine and productivity data manually
        </p>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="font-medium text-green-800">Entry saved successfully!</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Morning Routine Section */}
        <div className="card">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Morning Routine</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Wake Time</label>
              <input
                type="time"
                name="wake_time"
                value={formData.wake_time}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label className="label">Sleep Duration (hours)</label>
              <input
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
              <label className="label">Exercise (minutes)</label>
              <input
                type="number"
                name="exercise_minutes"
                value={formData.exercise_minutes}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <label className="label">Meditation (minutes)</label>
              <input
                type="number"
                name="meditation_minutes"
                value={formData.meditation_minutes}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <label className="label">Breakfast Quality</label>
              <select
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
              <label className="label">Morning Mood (1-10)</label>
              <input
                type="range"
                name="morning_mood"
                value={formData.morning_mood}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full"
              />
              <div className="text-center text-sm text-slate-600">{formData.morning_mood}</div>
            </div>
            <div>
              <label className="label">Caffeine Intake (mg)</label>
              <input
                type="number"
                name="caffeine_intake"
                value={formData.caffeine_intake}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <label className="label">Water Intake (ml)</label>
              <input
                type="number"
                name="water_intake_ml"
                value={formData.water_intake_ml}
                onChange={handleChange}
                min="0"
                step="100"
                className="input"
              />
            </div>
            <div>
              <label className="label">Screen Time Before Bed (min)</label>
              <input
                type="number"
                name="screen_time_before_bed"
                value={formData.screen_time_before_bed}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Productivity Section */}
        <div className="card">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Productivity</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="label">Productivity Score (1-10)</label>
              <input
                type="range"
                name="productivity_score"
                value={formData.productivity_score}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full"
              />
              <div className="text-center text-sm text-slate-600">
                {formData.productivity_score}
              </div>
            </div>
            <div>
              <label className="label">Tasks Planned</label>
              <input
                type="number"
                name="tasks_planned"
                value={formData.tasks_planned}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <label className="label">Tasks Completed</label>
              <input
                type="number"
                name="tasks_completed"
                value={formData.tasks_completed}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <label className="label">Focus Hours</label>
              <input
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
              <label className="label">Distractions Count</label>
              <input
                type="number"
                name="distractions_count"
                value={formData.distractions_count}
                onChange={handleChange}
                min="0"
                className="input"
              />
            </div>
            <div>
              <label className="label">Energy Level (1-10)</label>
              <input
                type="range"
                name="energy_level"
                value={formData.energy_level}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full"
              />
              <div className="text-center text-sm text-slate-600">{formData.energy_level}</div>
            </div>
            <div>
              <label className="label">Stress Level (1-10)</label>
              <input
                type="range"
                name="stress_level"
                value={formData.stress_level}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full"
              />
              <div className="text-center text-sm text-slate-600">{formData.stress_level}</div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="card">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">Notes</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={4}
            placeholder="Any additional notes about your day..."
            className="input"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => {
              setFormData(initialFormData);
              setSuccess(false);
              setError(null);
            }}
            className="btn-secondary"
          >
            Reset
          </button>
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save className="mr-2 inline h-4 w-4" />
                Save Entry
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ManualEntryPage() {
  return (
    <RequireAuth>
      <DashboardLayout>
        <ManualEntryContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
