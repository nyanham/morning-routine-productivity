'use client';

import { GitCompareArrows } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/contexts/AuthContext';
import { StatsNav } from '@/components/statistics';

/**
 * Compare Periods — placeholder page.
 *
 * Will allow users to select two date ranges (Period A / Period B) and
 * see a side-by-side comparison of key metrics.
 */
function CompareStatsContent() {
  return (
    <div className="space-y-8">
      <StatsNav />

      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 px-6 py-20 text-center backdrop-blur-md">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-indigo-400 to-indigo-600 text-white">
          <GitCompareArrows className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Compare Periods</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Side-by-side period comparison is coming soon. Pick two date ranges and see how your
          productivity, sleep, and routines evolved between them.
        </p>
      </div>
    </div>
  );
}

export default function CompareStatsPage() {
  return (
    <RequireAuth>
      <DashboardLayout title="Compare Periods">
        <CompareStatsContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
