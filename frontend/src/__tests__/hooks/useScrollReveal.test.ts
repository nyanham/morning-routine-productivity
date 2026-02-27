/**
 * Tests for the useScrollReveal custom hook.
 *
 * Uses a thin wrapper component that attaches the hook's ref to a
 * real DOM element, so the IntersectionObserver is created and we
 * can trigger its callback to verify visibility state changes.
 */

import { render, act } from '@testing-library/react';
import React from 'react';
import { useScrollReveal } from '@/hooks/useScrollReveal';

let observerCallback: IntersectionObserverCallback;
const mockObserve = jest.fn();
const mockUnobserve = jest.fn();
const mockDisconnect = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (global.IntersectionObserver as jest.Mock).mockImplementation(
    (cb: IntersectionObserverCallback) => {
      observerCallback = cb;
      return { observe: mockObserve, unobserve: mockUnobserve, disconnect: mockDisconnect };
    }
  );
});

/** Thin wrapper that attaches the hook's ref to a real DOM node. */
function TestComponent(props: { threshold?: number; rootMargin?: string }) {
  const { ref, isVisible } = useScrollReveal(props);
  return React.createElement(
    'div',
    { ref, 'data-testid': 'target' },
    isVisible ? 'visible' : 'hidden'
  );
}

describe('useScrollReveal', () => {
  it('starts with isVisible = false', () => {
    const { getByTestId } = render(React.createElement(TestComponent));
    expect(getByTestId('target').textContent).toBe('hidden');
  });

  it('creates an IntersectionObserver and observes the element', () => {
    render(React.createElement(TestComponent));
    expect(global.IntersectionObserver).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledTimes(1);
  });

  it('sets isVisible = true when the observer fires with isIntersecting', () => {
    const { getByTestId } = render(React.createElement(TestComponent));

    act(() => {
      observerCallback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(getByTestId('target').textContent).toBe('visible');
  });

  it('does not set isVisible when isIntersecting is false', () => {
    const { getByTestId } = render(React.createElement(TestComponent));

    act(() => {
      observerCallback(
        [{ isIntersecting: false } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    });

    expect(getByTestId('target').textContent).toBe('hidden');
  });

  it('disconnects the observer on unmount', () => {
    const { unmount } = render(React.createElement(TestComponent));
    unmount();
    expect(mockDisconnect).toHaveBeenCalled();
  });
});
