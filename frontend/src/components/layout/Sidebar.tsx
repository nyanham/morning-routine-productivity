'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sun, LayoutDashboard, ClipboardList, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Floating glass sidebar with expand-on-hover behaviour.
 *
 * - **Logo capsule** — pinned to the top-left corner.
 * - **Navigation capsule** — vertically centred on the viewport.
 *   Collapsed: icon-only (w-16).  On hover: smoothly widens to show labels (w-48).
 *
 * The Statistics sub-nav is **always rendered** and animated with a CSS
 * grid-rows transition (`0fr → 1fr`) so opening/closing is smooth
 * rather than an abrupt mount/unmount.
 *
 * Because this component lives in the route-level `dashboard/layout.tsx`
 * it mounts once and persists across all dashboard page navigations.
 */

const statsSubItems = [
  { href: '/dashboard/stats/personal', label: 'Your Statistics', color: 'bg-aqua-400' },
  { href: '/dashboard/stats/community', label: 'Community', color: 'bg-sky-400' },
  { href: '/dashboard/stats/compare', label: 'Compare', color: 'bg-indigo-400' },
  { href: '/dashboard/stats/correlations', label: 'Correlations', color: 'bg-violet-400' },
  { href: '/dashboard/stats/trends', label: 'Trends', color: 'bg-amber-400' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isStatsSection = pathname.startsWith('/dashboard/stats');

  return (
    <>
      {/* ── Logo — fixed top-left ── */}
      <Link
        href="/dashboard"
        aria-label="MorningFlow — Go to dashboard"
        className="fixed top-4 left-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/60 backdrop-blur-md transition-colors hover:bg-white/80"
      >
        <Sun className="text-aqua-500 h-7 w-7" aria-hidden="true" />
      </Link>

      {/* ── Navigation — vertically centred, expands on hover ── */}
      <aside
        aria-label="Main navigation"
        className={cn(
          'group/sidebar fixed top-1/2 left-4 z-30 -translate-y-1/2',
          'w-16 overflow-hidden rounded-2xl bg-white/70 p-2.5 shadow-md backdrop-blur-xl',
          'transition-[width] duration-300 ease-in-out hover:w-48'
        )}
      >
        <nav className="flex flex-col gap-1.5">
          {/* Overview */}
          <Link
            href="/dashboard"
            aria-current={pathname === '/dashboard' ? 'page' : undefined}
            className={cn(
              'flex h-11 items-center gap-3 rounded-xl px-2.5 transition-colors',
              pathname === '/dashboard'
                ? 'bg-aqua-600 text-white'
                : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-700'
            )}
          >
            <LayoutDashboard className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate text-sm font-medium opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
              Overview
            </span>
          </Link>

          {/* My Entries */}
          <Link
            href="/dashboard/entries"
            aria-current={pathname.startsWith('/dashboard/entries') ? 'page' : undefined}
            className={cn(
              'flex h-11 items-center gap-3 rounded-xl px-2.5 transition-colors',
              pathname.startsWith('/dashboard/entries')
                ? 'bg-aqua-600 text-white'
                : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-700'
            )}
          >
            <ClipboardList className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate text-sm font-medium opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
              My Entries
            </span>
          </Link>

          {/* Statistics */}
          <Link
            href="/dashboard/stats"
            aria-current={isStatsSection ? 'page' : undefined}
            className={cn(
              'flex h-11 items-center gap-3 rounded-xl px-2.5 transition-colors',
              isStatsSection
                ? 'bg-aqua-600 text-white'
                : 'text-slate-500 hover:bg-slate-100/60 hover:text-slate-700'
            )}
          >
            <BarChart3 className="h-5 w-5 shrink-0" aria-hidden="true" />
            <span className="truncate text-sm font-medium opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
              Statistics
            </span>
          </Link>

          {/* Stats sub-nav — always rendered, height animated with CSS grid */}
          <div
            className={cn(
              'grid transition-[grid-template-rows] duration-300 ease-in-out',
              isStatsSection ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
            )}
            role="group"
            aria-label="Statistics sub-sections"
          >
            <div className="overflow-hidden">
              <div className="flex flex-col gap-1 border-t border-slate-200/60 pt-1.5">
                {statsSubItems.map((sub) => {
                  const isSubActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      aria-current={isSubActive ? 'page' : undefined}
                      tabIndex={isStatsSection ? 0 : -1}
                      className={cn(
                        'flex h-8 items-center gap-3 rounded-lg px-3 transition-all',
                        isSubActive
                          ? 'bg-slate-100/80 text-slate-700 shadow-sm'
                          : 'text-slate-400 hover:bg-slate-100/50 hover:text-slate-600'
                      )}
                    >
                      <span
                        className={cn(
                          'h-2.5 w-2.5 shrink-0 rounded-full transition-transform',
                          sub.color,
                          isSubActive ? 'scale-125' : 'scale-100'
                        )}
                        aria-hidden="true"
                      />
                      <span className="truncate text-xs font-medium opacity-0 transition-opacity duration-300 group-hover/sidebar:opacity-100">
                        {sub.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>
      </aside>
    </>
  );
}
