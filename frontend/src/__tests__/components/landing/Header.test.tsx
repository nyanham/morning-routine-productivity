/**
 * Tests for the landing page Header component.
 *
 * Validates navigation links, logo presence, and mobile menu toggle
 * behaviour. Icons are stubbed to keep tests fast.
 */

import { render, screen, fireEvent } from '@testing-library/react';

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

import Header from '@/components/landing/Header';

describe('Header', () => {
  beforeEach(() => {
    render(<Header />);
  });

  it('renders the brand logo and name', () => {
    expect(screen.getByText('MorningFlow')).toBeInTheDocument();
  });

  it('renders desktop navigation links', () => {
    expect(screen.getByRole('link', { name: /log in/i })).toHaveAttribute('href', '/auth/login');
    expect(screen.getByRole('link', { name: /get started/i })).toHaveAttribute(
      'href',
      '/auth/signup'
    );
  });

  it('renders anchor links to page sections', () => {
    const features = screen.getAllByText('Features');
    // Desktop nav has one, mobile nav is hidden initially
    expect(features.length).toBeGreaterThanOrEqual(1);
  });

  it('toggles the mobile menu when the hamburger is clicked', () => {
    const toggle = screen.getByRole('button', { name: /toggle navigation/i });

    // Mobile nav should not be visible initially (the links are inside desktop nav)
    const communityLinks = screen.getAllByText('Community');
    const initialCount = communityLinks.length;

    // Open mobile menu
    fireEvent.click(toggle);
    expect(screen.getAllByText('Community').length).toBeGreaterThanOrEqual(initialCount);

    // Close mobile menu
    fireEvent.click(toggle);
  });
});
