/**
 * Tests for the HowItWorks section.
 *
 * Validates the three-step explanation renders with correct titles
 * and numbered badges.
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

import HowItWorks from '@/components/landing/HowItWorks';

describe('HowItWorks', () => {
  beforeEach(() => {
    render(<HowItWorks />);
  });

  it('renders the section heading', () => {
    expect(screen.getByRole('heading', { name: /three simple steps/i })).toBeInTheDocument();
  });

  it('renders step 1 — Log Your Morning', () => {
    expect(screen.getByText('Log Your Morning')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('renders step 2 — Explore Your Stats', () => {
    expect(screen.getByText('Explore Your Stats')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders step 3 — Improve & Compare', () => {
    expect(screen.getByText('Improve & Compare')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });
});
