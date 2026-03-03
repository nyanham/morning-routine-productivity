/**
 * Tests for the top-level landing page composition (`/`).
 *
 * Verifies that `page.tsx` assembles all expected sections — Header,
 * HeroSection, Features, CommunityPreview, HowItWorks, CTABanner,
 * and Footer — by checking for key heading text and landmark elements.
 *
 * Heavy or decorative child components (lucide icons, Fireflies,
 * RevealSection) are replaced with lightweight stubs so tests stay
 * fast and focused on structural correctness.
 */

import { render, screen } from '@testing-library/react';

// ── Stubs ──────────────────────────────────────────────────────────────────

jest.mock(
  'lucide-react',
  () =>
    new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop !== 'string') return undefined;
          const Icon = () => <span>{String(prop)}</span>;
          Icon.displayName = String(prop);
          return Icon;
        },
      }
    )
);

// RevealSection — pass children through so we can assert on content
jest.mock('@/components/landing/RevealSection', () => ({
  __esModule: true,
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

// Fireflies — purely decorative, replace with a no-op
jest.mock('@/components/landing/Fireflies', () => ({
  __esModule: true,
  default: () => <div data-testid="fireflies" />,
}));

import Home from '@/app/page';

// ── Tests ──────────────────────────────────────────────────────────────────

describe('Landing Page (page.tsx)', () => {
  beforeEach(() => {
    render(<Home />);
  });

  it('renders the brand name in header and footer', () => {
    // Both Header and Footer display the brand
    const brands = screen.getAllByText('MorningFlow');
    expect(brands.length).toBeGreaterThanOrEqual(2);
  });

  it('renders the hero headline', () => {
    expect(
      screen.getByRole('heading', { level: 1, name: /own your mornings/i })
    ).toBeInTheDocument();
  });

  it('renders the Features section heading', () => {
    expect(
      screen.getByRole('heading', { name: /everything you need to build better mornings/i })
    ).toBeInTheDocument();
  });

  it('renders the Community Insights section heading', () => {
    expect(
      screen.getByRole('heading', { name: /see how everyone else is doing/i })
    ).toBeInTheDocument();
  });

  it('renders the How It Works section heading', () => {
    expect(screen.getByRole('heading', { name: /three simple steps/i })).toBeInTheDocument();
  });

  it('renders the CTA banner', () => {
    expect(
      screen.getByRole('heading', { name: /ready to transform your mornings/i })
    ).toBeInTheDocument();
  });

  it('renders the footer with copyright', () => {
    expect(screen.getByText(/morningflow\. all rights reserved/i)).toBeInTheDocument();
  });

  it('has "Start for Free" and "Get Started" CTAs', () => {
    expect(screen.getByRole('link', { name: /start for free/i })).toHaveAttribute(
      'href',
      '/auth/signup'
    );
    // The CTA banner also links to signup
    expect(screen.getByRole('link', { name: /get started.*free/i })).toHaveAttribute(
      'href',
      '/auth/signup'
    );
  });
});
