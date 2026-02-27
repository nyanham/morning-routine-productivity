/**
 * Tests for the Footer component.
 *
 * Checks that the brand, product links, legal placeholders, and
 * copyright text are all rendered.
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

import Footer from '@/components/landing/Footer';

describe('Footer', () => {
  beforeEach(() => {
    render(<Footer />);
  });

  it('renders the brand name', () => {
    expect(screen.getByText('MorningFlow')).toBeInTheDocument();
  });

  it('renders the product description', () => {
    expect(screen.getByText(/track your mornings/i)).toBeInTheDocument();
  });

  it('contains product links', () => {
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Community Stats')).toBeInTheDocument();
    expect(screen.getByText('How It Works')).toBeInTheDocument();
  });

  it('contains legal placeholders', () => {
    expect(screen.getByText('Privacy Policy')).toBeInTheDocument();
    expect(screen.getByText('Terms of Service')).toBeInTheDocument();
  });

  it('displays the copyright with the current year', () => {
    const year = new Date().getFullYear();
    expect(screen.getByText(new RegExp(`${year}`))).toBeInTheDocument();
  });
});
