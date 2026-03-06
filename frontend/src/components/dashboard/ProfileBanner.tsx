'use client';

import { Plus } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Profile banner — the top card showing user identity and quick actions.
 *
 * Mirrors the patient-card pattern from the reference design:
 * avatar circle, name / secondary text, and a primary CTA button.
 */
export default function ProfileBanner() {
  const { user } = useAuthContext();

  const email = user?.email ?? '';
  const displayName = email.split('@')[0] || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  return (
    <div className="flex items-center gap-5 rounded-2xl bg-white/65 px-6 py-5 backdrop-blur-md">
      {/* Avatar */}
      <div
        className="bg-aqua-100 text-aqua-700 flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold"
        aria-hidden="true"
      >
        {initial}
      </div>

      {/* Identity */}
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-xl font-bold text-slate-800 capitalize">{displayName}</h2>
        <p className="text-sm text-slate-500">Member since {joinDate}</p>
      </div>

      {/* Actions */}
      <a
        href="/dashboard/entries/new"
        className="bg-aqua-600 hover:bg-aqua-700 focus-visible:ring-aqua-400 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-medium text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
        Log Today&apos;s Routine
      </a>
    </div>
  );
}
