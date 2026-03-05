'use client';

import { useState } from 'react';

/* ─────────────────────────────────────────────────────────────────────────────
 * BrandShapes — decorative, randomised abstract shapes for auth brand panels.
 *
 * Each page load produces a unique arrangement of shapes that differ by
 * variant:
 *
 *   • "login"  — soft circles & rings in warm **vanilla** tones
 *   • "signup" — angular squares, diamonds & triangles in vibrant **blush** tones
 *
 * The shapes are purely decorative (`aria-hidden`, `pointer-events-none`)
 * and sit behind the panel text via absolute positioning.
 *
 * Why randomise?  A subtle visual freshness on each visit keeps the UI
 * feeling alive without distracting from the primary content.
 * ────────────────────────────────────────────────────────────────────────── */

/** Supported visual variants — one per auth page. */
export type BrandShapesVariant = 'login' | 'signup';

interface BrandShapesProps {
  variant: BrandShapesVariant;
}

/* ── Helpers ────────────────────────────────────────────────────────────── */

/** Returns a random float between `min` and `max`. */
const rand = (min: number, max: number) => Math.random() * (max - min) + min;

/** Returns a random integer between `min` (inclusive) and `max` (inclusive). */
const randInt = (min: number, max: number) => Math.floor(rand(min, max + 1));

/** Pick a random element from an array. */
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)];

/* ── Palette tokens ─────────────────────────────────────────────────────
 * We use CSS custom-property values from the theme so the colours stay in
 * sync if the palette is ever tweaked. Per-shape transparency is controlled
 * via the descriptor's `opacity` field and applied at the element level,
 * rather than through an rgb(...) wrapper or alpha channel on the colour.
 * ──────────────────────────────────────────────────────────────────────── */

/**
 * Vanilla palette (login) — warm golden tones that contrast nicely
 * against the cool aqua gradient.
 */
const VANILLA_COLORS = [
  'var(--color-vanilla-100)',
  'var(--color-vanilla-200)',
  'var(--color-vanilla-400)',
] as const;

/**
 * Blush palette (signup) — vibrant pink/rose tones that add energetic
 * contrast to the aqua gradient.
 */
const BLUSH_COLORS = [
  'var(--color-blush-100)',
  'var(--color-blush-200)',
  'var(--color-blush-400)',
] as const;

/* ── Shape types ────────────────────────────────────────────────────────── */

type ShapeKind = 'filled-circle' | 'ring' | 'filled-rect' | 'rect-outline' | 'diamond' | 'triangle';

const LOGIN_SHAPES: readonly ShapeKind[] = ['filled-circle', 'ring', 'filled-circle', 'ring'];
const SIGNUP_SHAPES: readonly ShapeKind[] = ['filled-rect', 'rect-outline', 'diamond', 'triangle'];

/* ── Shape descriptor built at mount time ───────────────────────────────── */

interface ShapeDescriptor {
  kind: ShapeKind;
  /** CSS top in % */
  top: number;
  /** CSS left in % */
  left: number;
  /** Size in px */
  size: number;
  /** Rotation in deg */
  rotation: number;
  /** Opacity 0–1 */
  opacity: number;
  /** Fill / border colour as a CSS value */
  color: string;
  /** Whether the shape is an outline (border) rather than filled */
  outline: boolean;
}

/** Generate a single random shape descriptor for the given variant. */
function generateShape(variant: BrandShapesVariant): ShapeDescriptor {
  const isLogin = variant === 'login';
  const kind = pick(isLogin ? LOGIN_SHAPES : SIGNUP_SHAPES);
  const colors = isLogin ? VANILLA_COLORS : BLUSH_COLORS;

  return {
    kind,
    top: rand(-8, 95),
    left: rand(-8, 95),
    size: randInt(24, 180),
    rotation: isLogin ? rand(0, 360) : rand(0, 90),
    opacity: rand(0.08, 0.3),
    color: pick(colors),
    outline: kind === 'ring' || kind === 'rect-outline',
  };
}

/** Build the full set of shapes for one page load. */
function generateShapes(variant: BrandShapesVariant): ShapeDescriptor[] {
  const count = randInt(7, 14);
  return Array.from({ length: count }, () => generateShape(variant));
}

/* ── Renderers ──────────────────────────────────────────────────────────── */

/**
 * Converts a `ShapeDescriptor` into inline CSS properties.
 * We use inline styles because the values are fully dynamic (random).
 */
function shapeStyle(s: ShapeDescriptor): React.CSSProperties {
  const base: React.CSSProperties = {
    position: 'absolute',
    top: `${s.top}%`,
    left: `${s.left}%`,
    width: s.size,
    height: s.size,
    transform: `rotate(${s.rotation}deg)`,
    opacity: s.opacity,
  };

  if (s.outline) {
    return {
      ...base,
      border: `2px solid ${s.color}`,
      background: 'transparent',
    };
  }

  return { ...base, backgroundColor: s.color };
}

/** Render one shape element. */
function renderShape(s: ShapeDescriptor, index: number) {
  const style = shapeStyle(s);

  switch (s.kind) {
    /* ── Circles ── */
    case 'filled-circle':
      return <div key={index} style={{ ...style, borderRadius: '50%' }} />;
    case 'ring':
      return <div key={index} style={{ ...style, borderRadius: '50%' }} />;

    /* ── Rectangles / diamonds ── */
    case 'filled-rect':
      return <div key={index} style={{ ...style, borderRadius: 4 }} />;
    case 'rect-outline':
      return <div key={index} style={{ ...style, borderRadius: 4 }} />;
    case 'diamond':
      return (
        <div
          key={index}
          style={{
            ...style,
            transform: `rotate(${s.rotation + 45}deg)`,
            borderRadius: 4,
          }}
        />
      );

    /* ── Triangle (CSS borders trick) ── */
    case 'triangle': {
      const half = s.size / 2;
      return (
        <div
          key={index}
          style={{
            ...style,
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderLeft: `${half}px solid transparent`,
            borderRight: `${half}px solid transparent`,
            borderBottom: `${s.size}px solid ${s.color}`,
          }}
        />
      );
    }

    default:
      return null;
  }
}

/* ── Component ──────────────────────────────────────────────────────────── */

/**
 * Renders a set of randomly-generated decorative shapes inside the
 * auth brand panel.  The shapes are generated once per component mount
 * via a lazy `useState` initialiser, so they stay stable across
 * re-renders but refresh on each new page load.
 */
export default function BrandShapes({ variant }: BrandShapesProps) {
  // Lazy initialiser — runs only on the first render of this mount.
  const [shapes] = useState(() => generateShapes(variant));

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      {shapes.map((s, i) => renderShape(s, i))}
    </div>
  );
}
