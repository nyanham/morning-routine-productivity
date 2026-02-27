'use client';

import { useScrollReveal } from '@/hooks/useScrollReveal';

/**
 * A thin wrapper that applies a scroll-triggered reveal animation
 * to its children.
 *
 * Supports two animation styles:
 * - `'up'`    — slides up 32 px and fades in  (default)
 * - `'scale'` — scales from 0.92 → 1 and fades in
 *
 * The animation only fires once when the element scrolls into view,
 * and is disabled for users who prefer reduced motion.
 */
interface RevealSectionProps {
  children: React.ReactNode;
  animation?: 'up' | 'scale';
  /** Extra delay in ms before the animation starts. */
  delay?: number;
  className?: string;
}

export default function RevealSection({
  children,
  animation = 'up',
  delay = 0,
  className = '',
}: RevealSectionProps) {
  const { ref, isVisible } = useScrollReveal();

  const animationName = animation === 'scale' ? 'reveal-scale' : 'reveal-up';

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? undefined : 0,
        animation: isVisible ? `${animationName} 0.7s ease-out ${delay}ms both` : 'none',
      }}
    >
      {children}
    </div>
  );
}
