/**
 * Tests for the BrandShapes decorative component.
 *
 * Because shape generation is randomised we seed `Math.random` with a
 * deterministic stub so assertions are predictable across runs.
 *
 * Covers:
 * 1. **Rendering** — container attributes, child count within expected range.
 * 2. **Variant differentiation** — login shapes are round, signup shapes are angular.
 * 3. **Accessibility** — the wrapper is hidden from assistive tech.
 * 4. **Stability** — shapes stay the same across re-renders (lazy useState).
 */

import { render } from '@testing-library/react';
import BrandShapes from '@/components/auth/BrandShapes';

// ------------------------------------------------------------------ helpers --

/**
 * Seed Math.random with a simple linear-congruential generator so that
 * shape counts, positions, and types are predictable in tests.
 *
 * Why: The component relies on Math.random() at mount time. Without a
 * deterministic seed, child-count assertions would be flaky.
 */
function seedRandom(seed = 42) {
  let s = seed;
  const original = Math.random;

  Math.random = () => {
    // Park-Miller PRNG (simple & fast)
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };

  return () => {
    Math.random = original;
  };
}

// -------------------------------------------------------------------- tests --

describe('BrandShapes', () => {
  let restore: () => void;

  beforeEach(() => {
    restore = seedRandom(42);
  });

  afterEach(() => {
    restore();
  });

  // ── Rendering ────────────────────────────────────────────────────────
  describe('rendering', () => {
    it('renders an aria-hidden container', () => {
      const { container } = render(<BrandShapes variant="login" />);
      const wrapper = container.firstElementChild!;

      expect(wrapper).toHaveAttribute('aria-hidden', 'true');
    });

    it('renders the container with pointer-events-none', () => {
      const { container } = render(<BrandShapes variant="login" />);
      const wrapper = container.firstElementChild!;

      expect(wrapper.className).toContain('pointer-events-none');
    });

    it('generates between 7 and 14 shapes for login', () => {
      // Run multiple seeds to verify the range constraint.
      restore(); // restore original random first

      const counts: number[] = [];
      for (let seed = 1; seed <= 20; seed++) {
        const r = seedRandom(seed);
        const { container } = render(<BrandShapes variant="login" />);
        const wrapper = container.firstElementChild!;
        counts.push(wrapper.children.length);
        r();
      }

      counts.forEach((c) => {
        expect(c).toBeGreaterThanOrEqual(7);
        expect(c).toBeLessThanOrEqual(14);
      });
    });

    it('generates between 7 and 14 shapes for signup', () => {
      restore();

      const counts: number[] = [];
      for (let seed = 1; seed <= 20; seed++) {
        const r = seedRandom(seed);
        const { container } = render(<BrandShapes variant="signup" />);
        const wrapper = container.firstElementChild!;
        counts.push(wrapper.children.length);
        r();
      }

      counts.forEach((c) => {
        expect(c).toBeGreaterThanOrEqual(7);
        expect(c).toBeLessThanOrEqual(14);
      });
    });

    it('each shape child has inline styles with position absolute', () => {
      const { container } = render(<BrandShapes variant="login" />);
      const shapes = container.firstElementChild!.children;

      Array.from(shapes).forEach((el) => {
        expect((el as HTMLElement).style.position).toBe('absolute');
      });
    });
  });

  // ── Variant differentiation ──────────────────────────────────────────
  describe('variant differentiation', () => {
    it('login shapes use border-radius: 50% (circles/rings)', () => {
      const { container } = render(<BrandShapes variant="login" />);
      const shapes = Array.from(container.firstElementChild!.children) as HTMLElement[];

      // All login shapes should be circles or rings (border-radius: 50%)
      shapes.forEach((el) => {
        expect(el.style.borderRadius).toBe('50%');
      });
    });

    it('signup shapes do NOT all use border-radius: 50%', () => {
      const { container } = render(<BrandShapes variant="signup" />);
      const shapes = Array.from(container.firstElementChild!.children) as HTMLElement[];

      // At least one shape should not have border-radius 50% (angular shapes)
      const hasAngular = shapes.some((el) => el.style.borderRadius !== '50%');
      expect(hasAngular).toBe(true);
    });

    it('login shapes reference vanilla CSS custom properties', () => {
      const { container } = render(<BrandShapes variant="login" />);
      const html = container.innerHTML;

      expect(html).toContain('var(--color-vanilla-');
      expect(html).not.toContain('var(--color-blush-');
    });

    it('signup shapes reference blush CSS custom properties', () => {
      const { container } = render(<BrandShapes variant="signup" />);
      const html = container.innerHTML;

      expect(html).toContain('var(--color-blush-');
      expect(html).not.toContain('var(--color-vanilla-');
    });
  });

  // ── Accessibility ────────────────────────────────────────────────────
  describe('accessibility', () => {
    it('wrapper is aria-hidden so screen readers skip it', () => {
      const { container } = render(<BrandShapes variant="signup" />);
      expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
    });

    it('wrapper has pointer-events-none to avoid intercepting clicks', () => {
      const { container } = render(<BrandShapes variant="signup" />);
      expect(container.firstElementChild!.className).toContain('pointer-events-none');
    });
  });

  // ── Stability across re-renders ──────────────────────────────────────
  describe('stability', () => {
    it('produces the same shapes on re-render (lazy useState)', () => {
      const { container, rerender } = render(<BrandShapes variant="login" />);
      const firstHTML = container.innerHTML;

      // Re-render the same component — shapes should not change because
      // useState lazy initialiser only runs on mount.
      rerender(<BrandShapes variant="login" />);
      expect(container.innerHTML).toBe(firstHTML);
    });
  });
});
