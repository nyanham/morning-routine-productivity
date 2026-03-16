'use client';

import { Flame } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/contexts/AuthContext';
import { StatsNav } from '@/components/statistics';

/**
 * Trends & Streaks — placeholder page.
 *
 * Will show long-term trend lines, streak counters (consecutive days
 * hitting a goal), and milestone badges.
 */
function TrendsContent() {
  return (
    <div className="space-y-8">
      <StatsNav />

      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 px-6 py-20 text-center backdrop-blur-md">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-amber-400 to-orange-500 text-white">
          <Flame className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Trends & Streaks</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Track your streaks and celebrate consistency. Long-term trend visualization, streak
          counters, and milestone badges are coming soon.
        </p>
      </div>
    </div>
  );
}

export default function TrendsPage() {
  return (
    <RequireAuth>
      <DashboardLayout title="Trends & Streaks">
        <TrendsContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
