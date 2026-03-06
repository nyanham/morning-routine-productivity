'use client';

import { cn } from '@/lib/utils';

interface CircularProgressProps {
  /** Progress value from 0 to 100. */
  value: number;
  /** Diameter of the SVG in pixels. */
  size?: number;
  /** Ring thickness in pixels. */
  strokeWidth?: number;
  /** Tailwind `stroke-*` class for the progress arc. */
  color?: string;
  /** Text rendered at the center of the ring. */
  label?: string;
  /** Additional wrapper class names. */
  className?: string;
}

/**
 * SVG circular progress indicator.
 *
 * Renders a background ring and a colored arc whose length is
 * proportional to `value` (0–100). An optional `label` is centered
 * inside the ring — handy for showing a percentage.
 *
 * Accessible via `role="img"` with an auto-generated `aria-label`.
 */
export default function CircularProgress({
  value,
  size = 48,
  strokeWidth = 4,
  color = 'stroke-aqua-500',
  label,
  className,
}: CircularProgressProps) {
  const clamped = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      role="img"
      aria-label={`${Math.round(clamped)}% progress`}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200/60"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      {label && <span className="absolute text-[10px] font-semibold text-slate-700">{label}</span>}
    </div>
  );
}
