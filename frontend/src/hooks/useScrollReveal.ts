'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that observes when an element enters the viewport and
 * returns a boolean to trigger reveal animations.
 *
 * Uses `IntersectionObserver` with a configurable threshold and root
 * margin.  Once the element is revealed it stays visible (one-shot)
 * so scrolling back up doesn't re-trigger.
 *
 * @param options.threshold  – fraction of the element visible to trigger (default 0.15)
 * @param options.rootMargin – observer root margin (default "0px 0px -60px 0px")
 */
export function useScrollReveal(options?: { threshold?: number; rootMargin?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? '0px 0px -60px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return { ref, isVisible };
}
