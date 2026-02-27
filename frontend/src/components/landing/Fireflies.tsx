'use client';

import { useMemo } from 'react';

/**
 * Animated blurred-circle blobs for the hero section background.
 *
 * Renders large, soft, blurred circles that slowly drift and fade
 * in and out — giving the hero a living, breathing atmosphere.
 * Each blob gets a random position, size, colour, delay, and
 * drift vector so no two feel identical.
 *
 * The component is purely decorative — wrapped in `aria-hidden`
 * and `pointer-events-none` so it never blocks interactive content.
 *
 * CSS custom properties (`--drift-x`, `--drift-y`, etc.) drive the
 * `blob-drift` keyframe defined in `globals.css`.
 *
 * **Depth layers** — each blob is assigned a depth tier (back, mid,
 * or front). Farther blobs are larger, blurrier, slower, and more
 * translucent, while closer blobs are smaller, crisper, faster, and
 * slightly more opaque. This creates a natural parallax-like feel.
 */

/** Depth tier configuration: back → mid → front. */
interface DepthTier {
  sizeRange: [number, number];
  blurClass: string;
  durationRange: [number, number];
  opacityMultiplier: number;
  zIndex: number;
}

const DEPTH_TIERS: DepthTier[] = [
  // Back — large, very blurry, slow, faint
  {
    sizeRange: [400, 600],
    blurClass: 'blur-[80px]',
    durationRange: [18, 26],
    opacityMultiplier: 0.6,
    zIndex: 0,
  },
  // Mid — medium size, standard blur, moderate speed
  {
    sizeRange: [220, 400],
    blurClass: 'blur-3xl',
    durationRange: [13, 20],
    opacityMultiplier: 0.85,
    zIndex: 1,
  },
  // Front — smaller, crisper, faster, slightly brighter
  {
    sizeRange: [120, 260],
    blurClass: 'blur-2xl',
    durationRange: [10, 16],
    opacityMultiplier: 1,
    zIndex: 2,
  },
];

interface Blob {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: string;
  duration: string;
  driftX: string;
  driftY: string;
  driftEndX: string;
  driftEndY: string;
  color: string;
  blurClass: string;
  zIndex: number;
}

/**
 * Palette-derived colours.
 * The alpha is a *base* value — it gets multiplied by the depth
 * tier's `opacityMultiplier` so back-layer blobs feel more distant.
 */
const BASE_COLORS: [number, number, number, number][] = [
  [20, 168, 158, 0.3], // aqua-600
  [128, 229, 221, 0.25], // aqua-200
  [237, 217, 163, 0.28], // vanilla-200
  [244, 160, 172, 0.25], // blush-200
  [90, 180, 202, 0.25], // sky-400
];

function randomBetween(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export default function Fireflies({ count = 10 }: { count?: number }) {
  const blobs: Blob[] = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const tier = DEPTH_TIERS[i % DEPTH_TIERS.length];
        const [r, g, b, a] = BASE_COLORS[i % BASE_COLORS.length];
        return {
          id: i,
          top: `${randomBetween(-10, 80)}%`,
          left: `${randomBetween(-10, 90)}%`,
          size: Math.round(randomBetween(...tier.sizeRange)),
          delay: `${randomBetween(0, 14).toFixed(1)}s`,
          duration: `${randomBetween(...tier.durationRange).toFixed(1)}s`,
          driftX: `${randomBetween(-120, 120).toFixed(0)}px`,
          driftY: `${randomBetween(-100, 100).toFixed(0)}px`,
          driftEndX: `${randomBetween(-80, 80).toFixed(0)}px`,
          driftEndY: `${randomBetween(-60, 60).toFixed(0)}px`,
          color: `rgba(${r}, ${g}, ${b}, ${(a * tier.opacityMultiplier).toFixed(3)})`,
          blurClass: tier.blurClass,
          zIndex: tier.zIndex,
        };
      }),
    [count]
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {blobs.map((blob) => (
        <span
          key={blob.id}
          className={`absolute rounded-full ${blob.blurClass}`}
          style={
            {
              top: blob.top,
              left: blob.left,
              width: blob.size,
              height: blob.size,
              backgroundColor: blob.color,
              zIndex: blob.zIndex,
              animationName: 'blob-drift',
              animationDuration: blob.duration,
              animationTimingFunction: 'ease-in-out',
              animationDelay: blob.delay,
              animationIterationCount: 'infinite',
              animationFillMode: 'both',
              '--drift-x': blob.driftX,
              '--drift-y': blob.driftY,
              '--drift-end-x': blob.driftEndX,
              '--drift-end-y': blob.driftEndY,
              opacity: 0,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
