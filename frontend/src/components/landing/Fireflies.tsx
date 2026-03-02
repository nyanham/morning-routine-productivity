'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Animated blurred-circle blobs for the hero section background.
 *
 * Renders large, soft, blurred circles that slowly drift across
 * the hero — giving it a living, breathing atmosphere.  Each blob
 * gets a random position, size, colour, delay, and drift vector so
 * no two feel identical.
 *
 * **Fast entrance** — on page load every blob fades in quickly via
 * a staggered CSS opacity transition (≈ 0.15 s apart) instead of
 * waiting for the full `blob-drift` cycle.  The drift animation
 * (translate + scale) is purely spatial, so the two never conflict.
 *
 * **Parallax scroll** — a lightweight scroll listener shifts each
 * depth tier at a different rate along the Y axis, creating a
 * natural 3-D parallax feel.  Back-layer blobs move slowest;
 * front-layer blobs move fastest.
 *
 * The component is purely decorative — wrapped in `aria-hidden`
 * and `pointer-events-none` so it never blocks interactive content.
 *
 * CSS custom properties (`--drift-x`, `--drift-y`, etc.) drive the
 * `blob-drift` keyframe defined in `globals.css`.
 */

/* ────────────────────────────── depth tiers ───────────────────── */

/** Depth tier configuration: back → mid → front. */
interface DepthTier {
  sizeRange: [number, number];
  blurClass: string;
  durationRange: [number, number];
  opacityMultiplier: number;
  zIndex: number;
  /**
   * Parallax speed multiplier.  The scroll offset (in px) is
   * multiplied by this value to produce the tier's Y-translation.
   * Negative values push the layer *up* as the user scrolls down,
   * mimicking elements that are farther away.
   */
  parallaxSpeed: number;
}

const DEPTH_TIERS: DepthTier[] = [
  // Back — large, very blurry, slow, faint, barely moves on scroll
  {
    sizeRange: [400, 600],
    blurClass: 'blur-[80px]',
    durationRange: [18, 26],
    opacityMultiplier: 0.6,
    zIndex: 0,
    parallaxSpeed: 0.26,
  },
  // Mid — moderate parallax
  {
    sizeRange: [220, 400],
    blurClass: 'blur-3xl',
    durationRange: [13, 20],
    opacityMultiplier: 0.85,
    zIndex: 1,
    parallaxSpeed: 0.16,
  },
  // Front — crisper, faster, most pronounced scroll shift
  {
    sizeRange: [120, 260],
    blurClass: 'blur-2xl',
    durationRange: [10, 16],
    opacityMultiplier: 1,
    zIndex: 2,
    parallaxSpeed: 0.08,
  },
];

/* ───────────────────────────── blob shape ─────────────────────── */

interface Blob {
  id: number;
  top: string;
  left: string;
  size: number;
  /** Entrance stagger — short delay used for the opacity transition. */
  enterDelay: string;
  duration: string;
  driftX: string;
  driftY: string;
  driftEndX: string;
  driftEndY: string;
  color: string;
  blurClass: string;
  zIndex: number;
  /** Index into DEPTH_TIERS (0 = back, 1 = mid, 2 = front). */
  tierIndex: number;
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

/* ═══════════════════════ component ═══════════════════════════ */

export default function Fireflies({ count = 10 }: { count?: number }) {
  const [blobs, setBlobs] = useState<Blob[]>([]);
  const [entered, setEntered] = useState(false);

  /** Ref to the wrapper so we can read bounding‐rect for parallax. */
  const wrapperRef = useRef<HTMLDivElement>(null);
  /** Per-tier translateY values driven by scroll. */
  const [parallaxY, setParallaxY] = useState<number[]>([0, 0, 0]);

  // ── generate blobs on the client only (avoids hydration mismatch) ──
  useEffect(() => {
    setBlobs(
      Array.from({ length: count }, (_, i) => {
        const tier = DEPTH_TIERS[i % DEPTH_TIERS.length];
        const [r, g, b, a] = BASE_COLORS[i % BASE_COLORS.length];
        return {
          id: i,
          top: `${randomBetween(-10, 80)}%`,
          left: `${randomBetween(-10, 90)}%`,
          size: Math.round(randomBetween(...tier.sizeRange)),
          enterDelay: `${(i * 0.15).toFixed(2)}s`,
          duration: `${randomBetween(...tier.durationRange).toFixed(1)}s`,
          driftX: `${randomBetween(-120, 120).toFixed(0)}px`,
          driftY: `${randomBetween(-100, 100).toFixed(0)}px`,
          driftEndX: `${randomBetween(-80, 80).toFixed(0)}px`,
          driftEndY: `${randomBetween(-60, 60).toFixed(0)}px`,
          color: `rgba(${r}, ${g}, ${b}, ${(a * tier.opacityMultiplier).toFixed(3)})`,
          blurClass: tier.blurClass,
          zIndex: tier.zIndex,
          tierIndex: i % DEPTH_TIERS.length,
        };
      })
    );

    // Trigger entrance after two frames so the browser has
    // painted the opacity-0 state and the transition fires.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEntered(true));
    });
  }, [count]);

  // ── parallax scroll handler ──────────────────────────────────────
  const handleScroll = useCallback(() => {
    if (!wrapperRef.current) return;
    const rect = wrapperRef.current.getBoundingClientRect();
    // How many pixels the section has scrolled past the viewport top.
    // Positive when the section has begun leaving the viewport.
    const scrollOffset = -rect.top;
    setParallaxY(
      DEPTH_TIERS.map((tier) => Math.round(scrollOffset * tier.parallaxSpeed * 10) / 10)
    );
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // set initial position
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
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
              /* ── entrance ── */
              opacity: entered ? 1 : 0,
              transition: `opacity 1s ease-out ${blob.enterDelay}`,
              /* ── continuous drift (movement only, no opacity) ── */
              animationName: 'blob-drift',
              animationDuration: blob.duration,
              animationTimingFunction: 'ease-in-out',
              animationIterationCount: 'infinite',
              '--drift-x': blob.driftX,
              '--drift-y': blob.driftY,
              '--drift-end-x': blob.driftEndX,
              '--drift-end-y': blob.driftEndY,
              /* ── parallax scroll shift ── */
              willChange: 'opacity, translate',
              '--parallax-y': `${parallaxY[blob.tierIndex]}px`,
              marginTop: `var(--parallax-y)`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
