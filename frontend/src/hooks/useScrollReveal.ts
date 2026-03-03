'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

/* ── reduced-motion detection (SSR-safe) ────────────────────────── */

const motionQuery =
  typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;

/** Subscribe to changes in the user's reduced-motion preference. */
function subscribeMotion(cb: () => void) {
  motionQuery?.addEventListener('change', cb);
  return () => motionQuery?.removeEventListener('change', cb);
}

function getReducedMotion() {
  return motionQuery?.matches ?? false;
}

/** Always false on the server — avoids hydration mismatch. */
function getServerReducedMotion() {
  return false;
}

/**
 * Custom hook that observes when an element enters the viewport and
 * returns a boolean to trigger reveal animations.
 *
 * Uses `IntersectionObserver` with a configurable threshold and root
 * margin.  Once the element is revealed it stays visible (one-shot)
 * so scrolling back up doesn't re-trigger.
 *
 * When the user prefers reduced motion, `isVisible` is `true` from
 * the start so content is never hidden waiting for intersection.
 *
 * @param options.threshold  – fraction of the element visible to trigger (default 0.15)
 * @param options.rootMargin – observer root margin (default "0px 0px -60px 0px")
 */
export function useScrollReveal(options?: { threshold?: number; rootMargin?: string }) {
  const prefersReducedMotion = useSyncExternalStore(
    subscribeMotion,
    getReducedMotion,
    getServerReducedMotion
  );

  const ref = useRef<HTMLDivElement>(null);
  const [hasIntersected, setHasIntersected] = useState(false);

  useEffect(() => {
    // Nothing to observe when reduced motion is active — visibility
    // is derived below without waiting for intersection.
    if (prefersReducedMotion) return;

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      {
        threshold: options?.threshold ?? 0.15,
        rootMargin: options?.rootMargin ?? '0px 0px -60px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [prefersReducedMotion, options?.threshold, options?.rootMargin]);

  // Derive visibility: visible when reduced motion is active OR the
  // element has intersected.  This avoids a separate effect with
  // setState and responds instantly to runtime preference changes.
  const isVisible = prefersReducedMotion || hasIntersected;

  return { ref, isVisible, prefersReducedMotion };
}
