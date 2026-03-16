'use client';

import { Globe } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/contexts/AuthContext';
import { StatsNav } from '@/components/statistics';

/**
 * Community Statistics — placeholder page.
 *
 * Will eventually show aggregate metrics across all users, filterable
 * by date range, age group, and occupation.
 */
function CommunityStatsContent() {
  return (
    <div className="space-y-8">
      <StatsNav />

      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 px-6 py-20 text-center backdrop-blur-md">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-sky-400 to-sky-600 text-white">
          <Globe className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Community Statistics</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Aggregate trends across the community are coming soon. You&apos;ll be able to filter by
          date range, age group, and occupation to see how your routine compares.
        </p>
      </div>
    </div>
  );
}

export default function CommunityStatsPage() {
  return (
    <RequireAuth>
      <DashboardLayout title="Community Statistics">
        <CommunityStatsContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
