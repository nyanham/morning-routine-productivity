/**
 * Tests for the Fireflies (animated blob) component.
 *
 * Verifies that the correct number of decorative blob elements are
 * rendered, that they're hidden from assistive technology, and that
 * each blob receives required animation CSS custom properties.
 */

import { render } from '@testing-library/react';
import Fireflies from '@/components/landing/Fireflies';

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
    // The component sets these as inline CSS custom properties
    expect(blob.style.getPropertyValue('--drift-x')).toBeTruthy();
    expect(blob.style.getPropertyValue('--drift-y')).toBeTruthy();
    expect(blob.style.getPropertyValue('--drift-end-x')).toBeTruthy();
    expect(blob.style.getPropertyValue('--drift-end-y')).toBeTruthy();
  });

  it('assigns depth-related z-index to blobs', () => {
    const { container } = render(<Fireflies count={3} />);
    const blobs = container.querySelectorAll('span');
    const zIndexes = Array.from(blobs).map((b) => b.style.zIndex);
    // With 3 blobs cycling through 3 tiers: z-index 0, 1, 2
    expect(zIndexes).toEqual(['0', '1', '2']);
  });
});
