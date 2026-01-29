'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth, useAuthContext } from '@/contexts/AuthContext';
import { useUserProfile, useUserSettings } from '@/hooks/useApi';
import { Save, User, Bell, Palette, Globe, CheckCircle, AlertCircle } from 'lucide-react';
import type { UserProfileUpdate, UserSettingsUpdate } from '@/types';

function SettingsContent() {
  const { user } = useAuthContext();
  const profile = useUserProfile();
  const settings = useUserSettings();

  const [profileForm, setProfileForm] = useState<UserProfileUpdate>({
    full_name: '',
    display_name: '',
    timezone: 'UTC',
    bio: '',
    occupation: '',
  });

  const [settingsForm, setSettingsForm] = useState<UserSettingsUpdate>({
    theme: 'system',
    email_notifications: true,
    push_notifications: false,
    weekly_summary_email: true,
    reminder_time: '07:00',
    time_format: '12h',
    start_week_on: 'monday',
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    profile.fetch();
    settings.fetch();
  }, []);

  // Populate forms when data loads
  useEffect(() => {
    if (profile.data) {
      setProfileForm({
        full_name: profile.data.full_name || '',
        display_name: profile.data.display_name || '',
        timezone: profile.data.timezone || 'UTC',
        bio: profile.data.bio || '',
        occupation: profile.data.occupation || '',
      });
    }
  }, [profile.data]);

  useEffect(() => {
    if (settings.data) {
      setSettingsForm({
        theme: settings.data.theme || 'system',
        email_notifications: settings.data.email_notifications ?? true,
        push_notifications: settings.data.push_notifications ?? false,
        weekly_summary_email: settings.data.weekly_summary_email ?? true,
        reminder_time: settings.data.reminder_time || '07:00',
        time_format: settings.data.time_format || '12h',
        start_week_on: settings.data.start_week_on || 'monday',
      });
    }
  }, [settings.data]);

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProfileForm((prev) => ({ ...prev, [name]: value }));
    setSuccess(null);
    setError(null);
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setSettingsForm((prev) => ({ ...prev, [name]: newValue }));
    setSuccess(null);
    setError(null);
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await profile.update(profileForm);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await settings.update(settingsForm);
      setSuccess('Settings updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const isLoading = profile.loading || settings.loading;

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-600">Manage your profile and preferences</p>
      </div>

      {/* Success Banner */}
      {success && (
        <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <p className="font-medium text-green-800">{success}</p>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Profile Section */}
      <div className="card">
        <div className="mb-6 flex items-center gap-3">
          <User className="text-primary-600 h-6 w-6" />
          <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-10 rounded bg-slate-200"></div>
            <div className="h-10 rounded bg-slate-200"></div>
            <div className="h-20 rounded bg-slate-200"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input cursor-not-allowed bg-slate-50"
                />
              </div>
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={profileForm.full_name}
                  onChange={handleProfileChange}
                  className="input"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="label">Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={profileForm.display_name}
                  onChange={handleProfileChange}
                  className="input"
                  placeholder="johnd"
                />
              </div>
              <div>
                <label className="label">Occupation</label>
                <input
                  type="text"
                  name="occupation"
                  value={profileForm.occupation}
                  onChange={handleProfileChange}
                  className="input"
                  placeholder="Software Developer"
                />
              </div>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                rows={3}
                className="input"
                placeholder="Tell us about yourself..."
              />
            </div>
            <div>
              <label className="label">Timezone</label>
              <select
                name="timezone"
                value={profileForm.timezone}
                onChange={handleProfileChange}
                className="input"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Denver">Mountain Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
                <option value="Europe/London">London</option>
                <option value="Europe/Paris">Paris</option>
                <option value="Asia/Tokyo">Tokyo</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button onClick={handleSaveProfile} disabled={saving} className="btn-primary">
                {saving ? (
                  'Saving...'
                ) : (
                  <>
                    <Save className="mr-2 inline h-4 w-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Notifications Section */}
      <div className="card">
        <div className="mb-6 flex items-center gap-3">
          <Bell className="text-primary-600 h-6 w-6" />
          <h2 className="text-xl font-semibold text-slate-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="email_notifications"
              checked={settingsForm.email_notifications}
              onChange={handleSettingsChange}
              className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-slate-300"
            />
            <span className="text-slate-700">Email notifications</span>
          </label>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="weekly_summary_email"
              checked={settingsForm.weekly_summary_email}
              onChange={handleSettingsChange}
              className="text-primary-600 focus:ring-primary-500 h-4 w-4 rounded border-slate-300"
            />
            <span className="text-slate-700">Weekly summary email</span>
          </label>
          <div>
            <label className="label">Daily Reminder Time</label>
            <input
              type="time"
              name="reminder_time"
              value={settingsForm.reminder_time}
              onChange={handleSettingsChange}
              className="input w-auto"
            />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="card">
        <div className="mb-6 flex items-center gap-3">
          <Palette className="text-primary-600 h-6 w-6" />
          <h2 className="text-xl font-semibold text-slate-900">Preferences</h2>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="label">Theme</label>
              <select
                name="theme"
                value={settingsForm.theme}
                onChange={handleSettingsChange}
                className="input"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div>
              <label className="label">Time Format</label>
              <select
                name="time_format"
                value={settingsForm.time_format}
                onChange={handleSettingsChange}
                className="input"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
            <div>
              <label className="label">Start Week On</label>
              <select
                name="start_week_on"
                value={settingsForm.start_week_on}
                onChange={handleSettingsChange}
                className="input"
              >
                <option value="monday">Monday</option>
                <option value="sunday">Sunday</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end">
            <button onClick={handleSaveSettings} disabled={saving} className="btn-primary">
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="mr-2 inline h-4 w-4" />
                  Save Preferences
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <RequireAuth>
      <DashboardLayout>
        <SettingsContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
