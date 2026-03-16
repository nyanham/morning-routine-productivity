'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const tabs = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'My Entries', href: '/dashboard/entries' },
  { label: 'Statistics', href: '/dashboard/stats' },
  { label: 'Import Data', href: '/dashboard/import' },
  { label: 'Settings', href: '/dashboard/settings' },
];

/**
 * Horizontal tab bar for dashboard sections.
 *
 * Active tab is highlighted with an underline accent in the primary color,
 * matching the reference design's patient-tab pattern.
 */
export default function DashboardTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-1 border-b border-slate-200/40" aria-label="Dashboard sections">
      {tabs.map((tab) => {
        const isActive =
          tab.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              'relative px-5 py-3 text-sm font-medium transition-colors',
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
