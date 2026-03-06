'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, LayoutDashboard, ClipboardList, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Dashboard sidebar with MorningFlow branding and primary navigation.
 *
 * Mirrors the visual language of the landing and auth pages — aqua accent
 * highlights, Sun logo, and clean typography on a dark-slate gradient.
 *
 * Navigation items follow the new user flow:
 *   Overview → My Entries → Statistics
 *
 * Profile and Settings live in the top-right header dropdown instead.
 */

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/entries', label: 'My Entries', icon: ClipboardList },
  { href: '/dashboard/stats', label: 'Statistics', icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed top-0 left-0 flex h-screen w-64 flex-col bg-gradient-to-b from-slate-900 to-slate-800 text-white">
      {/* Logo */}
      <div className="border-b border-white/10 p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Sun className="text-aqua-400 h-8 w-8" />
          <span className="text-lg font-bold tracking-tight">MorningFlow</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Exact match for /dashboard; prefix match for sub-routes
            const isActive =
              item.href === '/dashboard'
                ? pathname === '/dashboard'
                : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-aqua-600/15 text-aqua-400'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
