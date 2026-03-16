'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { RequireAuth } from '@/contexts/AuthContext';
import { StatsNav } from '@/components/statistics';
import { BarChart3, Globe, GitCompareArrows, Waypoints, Flame, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Hub card definitions ──

interface HubCard {
  href: string;
  icon: React.ElementType;
  title: string;
  description: string;
  /** Gradient pair for the icon badge. */
  gradient: string;
  /** Accent text color for the arrow. */
  accent: string;
}

const HUB_CARDS: HubCard[] = [
  {
    href: '/dashboard/stats/personal',
    icon: BarChart3,
    title: 'Your Statistics',
    description:
      'Dive into your personal metrics — filter by date, group by day or week, and export data.',
    gradient: 'from-aqua-400 to-aqua-600',
    accent: 'text-aqua-600',
  },
  {
    href: '/dashboard/stats/community',
    icon: Globe,
    title: 'Community Statistics',
    description:
      'See how the community is doing — aggregate trends by age group, occupation, and more.',
    gradient: 'from-sky-400 to-sky-600',
    accent: 'text-sky-600',
  },
  {
    href: '/dashboard/stats/compare',
    icon: GitCompareArrows,
    title: 'Compare Periods',
    description:
      'Pick two time periods and compare them side by side to spot improvements or regressions.',
    gradient: 'from-indigo-400 to-indigo-600',
    accent: 'text-indigo-600',
  },
  {
    href: '/dashboard/stats/correlations',
    icon: Waypoints,
    title: 'Correlations Explorer',
    description:
      'Plot any two metrics against each other to discover hidden relationships in your data.',
    gradient: 'from-violet-400 to-violet-600',
    accent: 'text-violet-600',
  },
  {
    href: '/dashboard/stats/trends',
    icon: Flame,
    title: 'Trends & Streaks',
    description: 'Track your streaks, spot long-term trends, and celebrate consistency milestones.',
    gradient: 'from-amber-400 to-orange-500',
    accent: 'text-orange-600',
  },
];

// ── Hub card component ──

function HubCardLink({ card }: { card: HubCard }) {
  const Icon = card.icon;

  return (
    <Link
      href={card.href}
      className={cn(
        'group relative flex flex-col gap-4 rounded-2xl bg-white/60 p-6 backdrop-blur-md',
        'border border-white/40 transition-all',
        'hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-lg',
        'focus-visible:ring-aqua-400 focus-visible:ring-2 focus-visible:outline-none'
      )}
    >
      {/* Icon badge */}
      <div
        className={cn(
          'flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br text-white',
          card.gradient
        )}
        aria-hidden="true"
      >
        <Icon className="h-6 w-6" />
      </div>

      {/* Text */}
      <div className="flex-1">
        <h2 className="text-lg font-semibold text-slate-800">{card.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-slate-500">{card.description}</p>
      </div>

      {/* Arrow */}
      <div className={cn('flex items-center gap-1 text-sm font-medium', card.accent)}>
        Explore
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-1"
          aria-hidden="true"
        />
      </div>
    </Link>
  );
}

// ── Page content ──

function StatsHubContent() {
  return (
    <div className="space-y-8">
      <StatsNav />

      {/* Intro */}
      <div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
          Welcome to your statistics hub. Choose a section below to explore your morning routine and
          productivity data in depth.
        </p>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
