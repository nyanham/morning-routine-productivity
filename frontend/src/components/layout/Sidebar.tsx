'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, LayoutDashboard, ClipboardList, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating capsule sidebar — a compact, rounded icon rail that hovers
 * over the gradient background.
 *
 * Top slot: Sun logo linking to /dashboard.
 * Below: navigation icons for Overview, My Entries, Statistics.
 *
 * The sidebar only takes as much vertical space as its content needs,
 * centred vertically on the viewport for a clean, modern look.
 */

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/entries', label: 'My Entries', icon: ClipboardList },
  { href: '/dashboard/stats', label: 'Statistics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-1/2 left-4 z-30 -translate-y-1/2">
      <div className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/80 p-2.5 shadow-lg ring-1 ring-slate-200/60 backdrop-blur-sm">
        {/* Logo */}
        <Link
          href="/dashboard"
          title="MorningFlow"
          className="mb-1 flex h-11 w-11 items-center justify-center rounded-xl"
        >
          <Sun className="text-aqua-500 h-6 w-6" />
        </Link>

        {/* Divider */}
        <div className="h-px w-6 bg-slate-200" />

        {/* Nav icons */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                isActive
                  ? 'bg-aqua-600 shadow-aqua-600/25 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
