'use client';

import CircularProgress from './CircularProgress';
import type { AnalyticsSummary } from '@/types';

interface InsightItem {
  label: string;
  detail: string;
  /** 0–100 percentage for the circular progress ring. */
  score: number;
  color: string;
}

/**
 * Derive human-friendly wellness insights from the analytics summary.
 *
 * Each insight becomes a row with a label, sub-text, and a circular
 * progress ring — mirroring the "Potential risks" card from the
 * reference design.
 */
export function deriveInsights(summary: AnalyticsSummary | null): InsightItem[] {
  if (!summary) return [];

  const insights: InsightItem[] = [];

  if (summary.avg_productivity !== null) {
    const pct = Math.round((summary.avg_productivity / 10) * 100);
    insights.push({
      label: 'Productivity',
      detail: `Avg score: ${summary.avg_productivity.toFixed(1)}/10`,
      score: pct,
      color: pct >= 70 ? 'stroke-emerald-500' : pct >= 40 ? 'stroke-amber-500' : 'stroke-red-500',
    });
  }

  if (summary.avg_sleep !== null) {
    // 4–9 hrs mapped to 0–100
    const sleepPct = Math.min(Math.max(Math.round(((summary.avg_sleep - 4) / 5) * 100), 0), 100);
    insights.push({
      label: 'Sleep quality',
      detail: `Avg: ${summary.avg_sleep.toFixed(1)} hrs/night`,
      score: sleepPct,
      color:
        summary.avg_sleep >= 7
          ? 'stroke-emerald-500'
          : summary.avg_sleep >= 6
            ? 'stroke-amber-500'
            : 'stroke-red-500',
    });
  }

  if (summary.avg_exercise !== null) {
    // 0–30 min target mapped to 0–100
    const exPct = Math.min(Math.round((summary.avg_exercise / 30) * 100), 100);
    insights.push({
      label: 'Exercise habit',
      detail: `Avg: ${Math.round(summary.avg_exercise)} min/day`,
      score: exPct,
      color:
        exPct >= 70 ? 'stroke-emerald-500' : exPct >= 40 ? 'stroke-amber-500' : 'stroke-red-500',
    });
  }

  if (summary.productivity_trend) {
    const trendScore =
      summary.productivity_trend === 'up' ? 85 : summary.productivity_trend === 'stable' ? 60 : 30;
    insights.push({
      label: 'Trend momentum',
      detail:
        summary.productivity_trend === 'up'
          ? 'Improving this week'
          : summary.productivity_trend === 'stable'
            ? 'Holding steady'
            : 'Declining — take it easy',
      score: trendScore,
      color:
        summary.productivity_trend === 'up'
          ? 'stroke-emerald-500'
          : summary.productivity_trend === 'stable'
            ? 'stroke-sky-500'
            : 'stroke-red-500',
    });
  }

  return insights;
}

interface InsightsCardProps {
  summary: AnalyticsSummary | null;
}

/**
 * Right-sidebar wellness-insights card.
 *
 * Derives insight rows from the analytics summary and renders each
 * one with a label, helper text, and a circular-progress ring —
 * similar to the "Potential risks" card in the reference design.
 */
export default function InsightsCard({ summary }: InsightsCardProps) {
  const insights = deriveInsights(summary);

  if (insights.length === 0) {
    return (
      <div className="rounded-2xl bg-white/65 p-5 backdrop-blur-md">
        <h3 className="text-lg font-bold text-slate-800">Wellness insights</h3>
        <p className="mt-3 text-sm text-slate-400">Not enough data yet to show insights.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white/65 p-5 backdrop-blur-md">
      <h3 className="text-lg font-bold text-slate-800">
        Wellness insights <span className="font-normal text-slate-400">({insights.length})</span>
      </h3>

      <div className="mt-4 space-y-4">
        {insights.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-700">{item.label}</p>
              <p className="truncate text-xs text-slate-400">{item.detail}</p>
            </div>
            <CircularProgress
              value={item.score}
              size={44}
              strokeWidth={4}
              color={item.color}
              label={`${item.score}%`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
