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

// Mock requestAnimationFrame so the "entered" state fires synchronously.
beforeEach(() => {
  jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Fireflies', () => {
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
      expect(blob.style.animationName).toBe('blob-drift');
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

  it('transitions blobs to full opacity after entrance', () => {
    const { container } = render(<Fireflies count={3} />);
    const blobs = container.querySelectorAll('span');
    blobs.forEach((blob) => {
      // After rAF fires, opacity should be "1"
      expect(blob.style.opacity).toBe('1');
    });
  });

  it('staggers entrance delay across blobs', () => {
    const { container } = render(<Fireflies count={4} />);
    const blobs = container.querySelectorAll('span');
    const transitions = Array.from(blobs).map((b) => b.style.transition);
    // Each blob's transition delay should increase
    transitions.forEach((t, i) => {
      expect(t).toContain(`${(i * 0.15).toFixed(2)}s`);
    });
  });

  // ── parallax tests ──────────────────────────────────────────

  it('applies parallax margin-top based on scroll', () => {
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
    const marginTops = Array.from(blobs).map((b) => b.style.getPropertyValue('--parallax-y'));

    // Each tier should have a different parallax offset
    // Back (i=0, speed -0.04): 200 * -0.04 = -8
    // Mid  (i=1, speed -0.12): 200 * -0.12 = -24
    // Front(i=2, speed -0.22): 200 * -0.22 = -44
    expect(marginTops[0]).toBe('-8px');
    expect(marginTops[1]).toBe('-24px');
    expect(marginTops[2]).toBe('-44px');
  });
});
