'use client';

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

/**
 * Animated blurred-circle blobs for the hero section background.
 *
 * Renders large, soft, blurred circles that slowly drift across
 * the hero — giving it a living, breathing atmosphere.  Each blob
 * gets a random position, size, colour, delay, and drift vector so
 * no two feel identical.
 *
 * **Fast entrance** — on page load every blob fades in quickly via
 * a staggered CSS `blob-enter` animation (≈ 0.12 s apart) instead
 * of waiting for the full `blob-drift` cycle.  The drift animation
 * (translate + scale) is purely spatial, so the two never conflict.
 *
 * **Parallax scroll** — a lightweight scroll listener shifts each
 * depth tier at a different rate along the Y axis, creating a
 * natural 3-D parallax feel.  Back-layer blobs move slowest
 * (`0.08`); front-layer blobs move fastest (`0.26`).
 *
 * The component is purely decorative — wrapped in `aria-hidden`
 * and `pointer-events-none` so it never blocks interactive content.
 *
 * CSS custom properties (`--drift-x`, `--drift-y`, etc.) drive the
 * `blob-drift` keyframe defined in `globals.css`.
 *
 * **Hydration safety** — we use `useSyncExternalStore` to detect
 * whether we are on the client.  This avoids calling `setState`
 * inside an effect (which triggers the `react-hooks/set-state-in-
 * effect` lint rule) while still preventing SSR/client mismatches.
 */

/* ────────────────────────────── client detection ─────────────── */

/**
 * Returns `true` on the client and `false` during SSR.
 *
 * Uses `useSyncExternalStore` with a separate server snapshot so
 * React replays the render on the client without a hydration
 * mismatch — the officially blessed pattern for client-only content.
 */
const emptySubscribe = () => () => {};
function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

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
   * Smaller positive values move the layer less, mimicking elements
   * that are farther away (back = 0.08, front = 0.26).
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
    parallaxSpeed: 0.08,
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
    parallaxSpeed: 0.26,
  },
];

/* ───────────────────────────── blob shape ─────────────────────── */

interface BlobData {
  id: number;
  top: string;
  left: string;
  size: number;
  /** Stagger delay for the `blob-enter` CSS animation. */
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

/** Builds the blob array. Extracted so `useMemo` stays readable. */
function generateBlobs(count: number): BlobData[] {
  return Array.from({ length: count }, (_, i) => {
    const tier = DEPTH_TIERS[i % DEPTH_TIERS.length];
    const [r, g, b, a] = BASE_COLORS[i % BASE_COLORS.length];
    return {
      id: i,
      top: `${randomBetween(-10, 80)}%`,
      left: `${randomBetween(-10, 90)}%`,
      size: Math.round(randomBetween(...tier.sizeRange)),
      enterDelay: `${(i * 0.12).toFixed(2)}s`,
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
  });
}

export default function Fireflies({ count = 10 }: { count?: number }) {
  const hydrated = useHydrated();

  // Blob data is computed once on the client.  `useMemo` avoids
  // calling setState inside an effect (which would cascade renders).
  // During SSR `hydrated` is false so we return an empty array,
  // matching the server-rendered HTML.
  const blobs = useMemo<BlobData[]>(
    () => (hydrated ? generateBlobs(count) : []),
    [hydrated, count]
  );

  /** Ref to the wrapper so we can read bounding-rect for parallax. */
  const wrapperRef = useRef<HTMLDivElement>(null);
  /** Per-tier translateY values driven by scroll. */
  const [parallaxY, setParallaxY] = useState<number[]>([0, 0, 0]);
  /**
   * ID of the currently scheduled animation frame for scroll handling.
   *
   * We throttle scroll-driven work to once per animation frame to avoid
   * redundant layout reads (`getBoundingClientRect`) and React re-renders
   * during very fast scrolling.
   */
  const frameIdRef = useRef<number | null>(null);

  // ── parallax scroll handler ──────────────────────────────────────
  const handleScroll = useCallback(() => {
    // If a frame is already scheduled, coalesce this scroll event.
    if (frameIdRef.current !== null) return;

    frameIdRef.current = window.requestAnimationFrame(() => {
      frameIdRef.current = null;
      if (!wrapperRef.current) return;

      const rect = wrapperRef.current.getBoundingClientRect();
      // How many pixels the section has scrolled past the viewport top.
      // Positive when the section has begun leaving the viewport.
      const scrollOffset = -rect.top;
      setParallaxY(
        DEPTH_TIERS.map((tier) => Math.round(scrollOffset * tier.parallaxSpeed * 10) / 10)
      );
    });
  }, []);

  useEffect(() => {
    // Skip scroll-driven motion when the user prefers reduced motion.
    // CSS animations are already neutralised by the global reduced-motion
    // block in globals.css, but this JS-driven parallax must be gated here.
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // set initial position

    // If the preference changes while mounted, tear down the listener.
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        window.removeEventListener('scroll', handleScroll);
        setParallaxY([0, 0, 0]);
      } else {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
      }
    };
    motionQuery.addEventListener('change', onChange);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      motionQuery.removeEventListener('change', onChange);
      // Clean up any pending animation frame when the effect is torn down.
      if (frameIdRef.current !== null) {
        cancelAnimationFrame(frameIdRef.current);
        frameIdRef.current = null;
      }
    };
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
              /* ── entrance + drift (two CSS animations) ── */
              animation: [
                `blob-enter 0.8s ease-out ${blob.enterDelay} both`,
                `blob-drift ${blob.duration} ease-in-out infinite`,
              ].join(', '),
              '--drift-x': blob.driftX,
              '--drift-y': blob.driftY,
              '--drift-end-x': blob.driftEndX,
              '--drift-end-y': blob.driftEndY,
              /* ── parallax scroll shift ── */
              willChange: 'opacity, translate',
              transform: `translateY(${parallaxY[blob.tierIndex]}px)`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
