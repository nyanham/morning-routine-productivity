'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/contexts/AuthContext';
import { BarChart3, Globe, GitCompareArrows, Waypoints, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Hub card definitions ──

interface HubCard {
  href: string;
  icon: React.ElementType;
  title: string;
  /** Gradient classes for the fully-colored card background. */
  gradient: string;
}

const HUB_CARDS: HubCard[] = [
  {
    href: '/dashboard/stats/personal',
    icon: BarChart3,
    title: 'Your Statistics',
    gradient: 'from-aqua-400 to-aqua-600',
  },
  {
    href: '/dashboard/stats/community',
    icon: Globe,
    title: 'Community',
    gradient: 'from-sky-400 to-sky-600',
  },
  {
    href: '/dashboard/stats/compare',
    icon: GitCompareArrows,
    title: 'Compare Periods',
    gradient: 'from-indigo-400 to-indigo-600',
  },
  {
    href: '/dashboard/stats/correlations',
    icon: Waypoints,
    title: 'Correlations',
    gradient: 'from-violet-400 to-violet-600',
  },
  {
    href: '/dashboard/stats/trends',
    icon: Flame,
    title: 'Trends & Streaks',
    gradient: 'from-amber-400 to-orange-500',
  },
];

// ── Hub card component — fully colored, icon centered, title on hover ──

function HubCardLink({ card }: { card: HubCard }) {
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      className={cn(
        'group relative flex aspect-square items-center justify-center rounded-2xl bg-linear-to-br text-white shadow-md',
        'transition-all hover:-translate-y-1 hover:shadow-xl',
        'focus-visible:ring-2 focus-visible:ring-white/80 focus-visible:outline-none',
        card.gradient
      )}
    >
      <Icon className="h-10 w-10 transition-transform group-hover:scale-110" aria-hidden="true" />

      {/* Title overlay — appears on hover */}
      <span className="absolute inset-x-0 bottom-0 rounded-b-2xl bg-black/25 px-3 py-2 text-center text-sm font-semibold text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
        {card.title}
      </span>
    </Link>
  );
}

// ── Page content ──

function StatsHubContent() {
  return (
    <div className="space-y-8">
      {/* Intro */}
      <div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Welcome to your statistics hub. Choose a section below to explore your morning routine and
          productivity data in depth.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
        {HUB_CARDS.map((card) => (
          <HubCardLink key={card.href} card={card} />
        ))}
      </div>
    </div>
  );
}

// ── Page export ──

export default function StatsHubPage() {
  return (
    <RequireAuth>
      <DashboardLayout title="Statistics">
        <StatsHubContent />
      </DashboardLayout>
    </RequireAuth>
  );
}
