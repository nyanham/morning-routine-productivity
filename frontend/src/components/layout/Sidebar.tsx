'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, LayoutDashboard, ClipboardList, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating sidebar — two separate translucent capsules aligned to the
 * top-left of the viewport.
 *
 * 1. Logo capsule: Sun icon linking to /dashboard.
 * 2. Navigation capsule: Overview, My Entries, Statistics icons.
 *
 * Both capsules use a semi-transparent background with backdrop-blur
 * and no borders or shadows for a clean, modern aesthetic.
 */

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/entries', label: 'My Entries', icon: ClipboardList },
  { href: '/dashboard/stats', label: 'Statistics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-4 left-4 z-30 flex flex-col gap-3" aria-label="Main navigation">
      {/* Logo capsule — sized to match the nav capsule width */}
      <Link
        href="/dashboard"
        title="MorningFlow — Go to dashboard"
        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md transition-colors hover:bg-white/80"
      >
        <Sun className="text-aqua-500 h-8 w-8" />
      </Link>

      {/* Navigation capsule */}
      <nav className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/60 p-2.5 backdrop-blur-md">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl transition-colors',
                isActive
                  ? 'bg-aqua-600 text-white'
                  : 'text-slate-400 hover:bg-white/60 hover:text-slate-600'
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
