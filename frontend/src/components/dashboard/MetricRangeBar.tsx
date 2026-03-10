import { cn } from '@/lib/utils';

interface MetricRangeBarProps {
  /** Current metric value. */
  value: number;
  /** Minimum of the display range. */
  min: number;
  /** Maximum of the display range. */
  max: number;
  /** Start of the optimal (green) zone. Falls back to 30 % of range. */
  optimalMin?: number;
  /** End of the optimal (green) zone. Falls back to 70 % of range. */
  optimalMax?: number;
  /** Whether the value is outside the healthy range (shows amber marker). */
  isWarning?: boolean;
}

/**
 * Horizontal range bar with three visual segments (low / optimal / high)
 * and a circular marker positioned at the current `value`.
 *
 * Inspired by the lab-result range bars in the reference design.
 */
export default function MetricRangeBar({
  value,
  min,
  max,
  optimalMin,
  optimalMax,
  isWarning = false,
}: MetricRangeBarProps) {
  const range = max - min || 1;
  const position = Math.min(Math.max(((value - min) / range) * 100, 2), 98);

  const oMin = optimalMin ?? min + range * 0.3;
  const oMax = optimalMax ?? min + range * 0.7;
  const lowEnd = ((oMin - min) / range) * 100;
  const highStart = ((oMax - min) / range) * 100;

  return (
    <div
      className="relative h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-label={`${value} out of ${min}–${max} range`}
    >
      {/* Low zone */}
      <div
        className="absolute inset-y-0 left-0 rounded-l-full bg-slate-300/40"
        style={{ width: `${lowEnd}%` }}
      />
      {/* Optimal zone */}
      <div
        className="absolute inset-y-0 bg-emerald-400/50"
        style={{ left: `${lowEnd}%`, width: `${highStart - lowEnd}%` }}
      />
      {/* High zone */}
      <div
        className="absolute inset-y-0 right-0 rounded-r-full bg-slate-300/40"
        style={{ width: `${100 - highStart}%` }}
      />
      {/* Marker */}
      <div
        className={cn(
          'absolute top-1/2 h-3.5 w-3.5 rounded-full border-2 border-white shadow-sm',
          isWarning ? 'bg-amber-400' : 'bg-aqua-500'
        )}
        style={{ left: `${position}%`, transform: `translate(-50%, -50%)` }}
      />
    </div>
  );
}
