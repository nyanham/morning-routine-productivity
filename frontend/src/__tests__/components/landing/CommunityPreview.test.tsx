/**
 * Tests for the CommunityPreview section.
 *
 * Verifies that all four community stat bubbles render with their
 * expected values and labels.
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

import CommunityPreview from '@/components/landing/CommunityPreview';

describe('CommunityPreview', () => {
  beforeEach(() => {
    render(<CommunityPreview />);
  });

  it('renders the section heading', () => {
    expect(
      screen.getByRole('heading', { name: /see how everyone else is doing/i })
    ).toBeInTheDocument();
  });

  it('renders the average sleep stat', () => {
    expect(screen.getByText('7.1 h')).toBeInTheDocument();
    expect(screen.getByText('Avg. Sleep')).toBeInTheDocument();
  });

  it('renders the average productivity stat', () => {
    expect(screen.getByText('7.4')).toBeInTheDocument();
    expect(screen.getByText('Avg. Productivity')).toBeInTheDocument();
  });

  it('renders the most productive day stat', () => {
    expect(screen.getByText('Tuesday')).toBeInTheDocument();
  });

  it('renders the active users stat', () => {
    expect(screen.getByText('1,200+')).toBeInTheDocument();
  });

  it('shows the sign-up prompt', () => {
    expect(screen.getByText(/sign up to explore/i)).toBeInTheDocument();
  });
});
