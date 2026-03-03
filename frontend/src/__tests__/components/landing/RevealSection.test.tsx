/**
 * Tests for the RevealSection scroll-reveal wrapper.
 *
 * Uses a mocked IntersectionObserver (from jest.setup.ts) to verify
 * that the component starts invisible and becomes visible once the
 * observer fires.
 */

import { render, act } from '@testing-library/react';
import RevealSection from '@/components/landing/RevealSection';

// Capture the IntersectionObserver callback so we can trigger it manually
let observerCallback: IntersectionObserverCallback;

beforeEach(() => {
  (global.IntersectionObserver as jest.Mock).mockImplementation(
    (cb: IntersectionObserverCallback) => {
      observerCallback = cb;
      return { observe: jest.fn(), unobserve: jest.fn(), disconnect: jest.fn() };
    }
  );
});

describe('RevealSection', () => {
  it('starts with opacity 0 before intersection', () => {
    const { container } = render(
      <RevealSection>
        <p>Hello</p>
      </RevealSection>
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.opacity).toBe('0');
  });

  it('reveals content once the element intersects', () => {
    const { container } = render(
      <RevealSection>
        <p>Hello</p>
      </RevealSection>
    );
    const wrapper = container.firstElementChild as HTMLElement;

    // Simulate the observer firing
    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    // After intersection, opacity style should be removed (controlled by animation)
    expect(wrapper.style.opacity).not.toBe('0');
    expect(wrapper.style.animation).toContain('reveal-up');
  });

  it('applies the scale animation variant', () => {
    const { container } = render(
      <RevealSection animation="scale">
        <p>Hello</p>
      </RevealSection>
    );
    const wrapper = container.firstElementChild as HTMLElement;

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(wrapper.style.animation).toContain('reveal-scale');
  });

  it('includes delay in the animation shorthand', () => {
    const { container } = render(
      <RevealSection delay={200}>
        <p>Hello</p>
      </RevealSection>
    );
    const wrapper = container.firstElementChild as HTMLElement;

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(wrapper.style.animation).toContain('200ms');
  });

  it('passes className through to the wrapper', () => {
    const { container } = render(
      <RevealSection className="my-custom-class">
        <p>Hello</p>
      </RevealSection>
    );
    expect(container.firstElementChild).toHaveClass('my-custom-class');
  });
});
