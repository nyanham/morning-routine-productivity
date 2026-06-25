'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Hub', href: '/dashboard/stats' },
  { label: 'Your Statistics', href: '/dashboard/stats/personal' },
  { label: 'Community', href: '/dashboard/stats/community' },
  { label: 'Compare Periods', href: '/dashboard/stats/compare' },
  { label: 'Correlations', href: '/dashboard/stats/correlations' },
  { label: 'Trends & Streaks', href: '/dashboard/stats/trends' },
];

/**
 * Horizontal tab navigation for statistics sub-sections.
 *
 * Active tab gets an aqua underline accent, consistent with
 * the DashboardTabs pattern used elsewhere in the app.
 */
export default function StatsNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-slate-200/40"
      aria-label="Statistics sections"
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/dashboard/stats'
            ? pathname === '/dashboard/stats'
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative shrink-0 px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors',
              isActive ? 'text-aqua-700' : 'text-slate-500 hover:text-slate-700'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
            {isActive && (
              <span className="bg-aqua-600 absolute inset-x-1 bottom-0 h-0.5 rounded-full" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
