'use client';

import { Waypoints } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/contexts/AuthContext';
import { StatsNav } from '@/components/statistics';

/**
 * Correlations Explorer — placeholder page.
 *
 * Will let users pick two metrics (X and Y axes) and render a scatter
 * plot with a correlation coefficient and trend line.
 */
function CorrelationsContent() {
  return (
    <div className="space-y-8">
      <StatsNav />

      <div className="flex flex-col items-center justify-center rounded-2xl bg-white/60 px-6 py-20 text-center backdrop-blur-md">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-violet-400 to-violet-600 text-white">
          <Waypoints className="h-8 w-8" aria-hidden="true" />
        </div>
        <h2 className="text-xl font-semibold text-slate-800">Correlations Explorer</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500">
          Discover relationships between your metrics — for example, does more sleep lead to higher
          productivity? Scatter plots and correlation analysis are coming soon.
        </p>
      </div>
    </div>
  );
}

export default function CorrelationsPage() {
  return (
    <RequireAuth>
      <DashboardLayout title="Correlations Explorer">
        <CorrelationsContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
