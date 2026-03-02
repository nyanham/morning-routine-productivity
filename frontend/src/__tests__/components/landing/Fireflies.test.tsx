/**
 * Tests for the Fireflies (animated blob) component.
 *
 * Verifies that the correct number of decorative blob elements are
 * rendered, that they're hidden from assistive technology, that
 * each blob receives required animation CSS custom properties,
 * and that the fast-entrance + parallax behaviours work correctly.
 */

import { act, render } from '@testing-library/react';
import Fireflies from '@/components/landing/Fireflies';

describe('Fireflies', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the default number of blobs (10)', () => {
    const { container } = render(<Fireflies />);
    const blobs = container.querySelectorAll('span');
    expect(blobs).toHaveLength(10);
  });

  it('respects a custom count prop', () => {
    const { container } = render(<Fireflies count={5} />);
    const blobs = container.querySelectorAll('span');
    expect(blobs).toHaveLength(5);
  });

  it('is hidden from assistive technology', () => {
    const { container } = render(<Fireflies />);
    const wrapper = container.firstElementChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies blob-drift animation to each particle', () => {
    const { container } = render(<Fireflies count={3} />);
    const blobs = container.querySelectorAll('span');
    blobs.forEach((blob) => {
      // The `animation` shorthand contains both blob-enter and blob-drift
      expect(blob.style.animation).toContain('blob-drift');
    });
  });

  it('sets CSS custom properties for drift vectors', () => {
    const { container } = render(<Fireflies count={1} />);
    const blob = container.querySelector('span')!;
    expect(blob.style.getPropertyValue('--drift-x')).toBeTruthy();
    expect(blob.style.getPropertyValue('--drift-y')).toBeTruthy();
    expect(blob.style.getPropertyValue('--drift-end-x')).toBeTruthy();
    expect(blob.style.getPropertyValue('--drift-end-y')).toBeTruthy();
  });

  it('assigns depth-related z-index to blobs', () => {
    const { container } = render(<Fireflies count={3} />);
    const blobs = container.querySelectorAll('span');
    const zIndexes = Array.from(blobs).map((b) => b.style.zIndex);
    expect(zIndexes).toEqual(['0', '1', '2']);
  });

  // ── fast-entrance tests ──────────────────────────────────────

  it('includes blob-enter animation for fast fade-in', () => {
    const { container } = render(<Fireflies count={3} />);
    const blobs = container.querySelectorAll('span');
    blobs.forEach((blob) => {
      expect(blob.style.animation).toContain('blob-enter');
    });
  });

  it('staggers entrance delay across blobs', () => {
    const { container } = render(<Fireflies count={4} />);
    const blobs = container.querySelectorAll('span');
    const animations = Array.from(blobs).map((b) => b.style.animation);
    // Each blob's blob-enter delay should increase (0.12s per blob)
    animations.forEach((anim, i) => {
      expect(anim).toContain(`${(i * 0.12).toFixed(2)}s`);
    });
  });

  // ── parallax tests ──────────────────────────────────────────

  it('applies parallax translateY based on scroll', () => {
    const { container } = render(<Fireflies count={3} />);

    // Simulate the wrapper being 200px above the viewport
    const wrapper = container.firstElementChild as HTMLElement;
    jest.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      top: -200,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
    });

    // Fire scroll
    act(() => {
      window.dispatchEvent(new Event('scroll'));
    });

    const blobs = container.querySelectorAll('span');
    const transforms = Array.from(blobs).map((b) => b.style.transform);

    // Each tier should have a different parallax offset
    // Back  (i=0, speed 0.26): 200 * 0.26 = 52
    // Mid   (i=1, speed 0.16): 200 * 0.16 = 32
    // Front (i=2, speed 0.08): 200 * 0.08 = 16
    expect(transforms[0]).toBe('translateY(52px)');
    expect(transforms[1]).toBe('translateY(32px)');
    expect(transforms[2]).toBe('translateY(16px)');
  });
});
