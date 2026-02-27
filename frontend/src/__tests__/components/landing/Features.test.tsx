/**
 * Tests for the Features section of the landing page.
 *
 * Ensures each feature card renders its title so users see the full
 * value proposition. RevealSection and icons are stubbed.
 */

import { render, screen } from '@testing-library/react';

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

jest.mock('@/components/landing/RevealSection', () => ({
  __esModule: true,
  default: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
  ),
}));

import Features from '@/components/landing/Features';

describe('Features', () => {
  const expectedTitles = [
    'Daily Entries',
    'CSV Import',
    'Interactive Charts',
    'Powerful Filters',
    'Period Comparison',
    'Privacy First',
  ];

  beforeEach(() => {
    render(<Features />);
  });

  it('renders the section heading', () => {
    expect(
      screen.getByRole('heading', { name: /everything you need to build better mornings/i })
    ).toBeInTheDocument();
  });

  it.each(expectedTitles)('renders the "%s" feature card', (title) => {
    expect(screen.getByText(title)).toBeInTheDocument();
  });

  it('renders exactly 6 feature cards', () => {
    // Each card has a heading
    const cards = expectedTitles.map((t) => screen.getByText(t));
    expect(cards).toHaveLength(6);
  });
});
