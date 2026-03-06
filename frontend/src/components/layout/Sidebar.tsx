'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ClipboardList, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Narrow icon-rail sidebar inspired by the medical-dashboard reference.
 *
 * Sits below the full-width header and provides icon-only navigation
 * with tooltips. Active route gets an aqua highlight.
 *
 * Routes: Overview → My Entries → Statistics
 */

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/entries', label: 'My Entries', icon: ClipboardList },
  { href: '/dashboard/stats', label: 'Statistics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-16 left-0 flex h-[calc(100vh-4rem)] w-[72px] flex-col items-center border-r border-slate-200 bg-white py-4">
      <nav className="flex flex-col items-center gap-2">
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
                  ? 'bg-aqua-100 text-aqua-600'
                  : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
              )}
            >
              <Icon className="h-5 w-5" />
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
