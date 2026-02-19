/**
 * Tests for the FullPageSpinner shared UI component.
 *
 * Verifies rendering, default/custom messages, and accessibility attributes.
 */

import { render, screen } from '@testing-library/react';
import FullPageSpinner from '@/components/ui/FullPageSpinner';

describe('FullPageSpinner', () => {
  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------

  it('renders with the default message when no props are provided', () => {
    render(<FullPageSpinner />);

    expect(screen.getByText('Loading…')).toBeInTheDocument();
  });

  it('renders with a custom message', () => {
    render(<FullPageSpinner message="Checking session…" />);

    expect(screen.getByText('Checking session…')).toBeInTheDocument();
    expect(screen.queryByText('Loading…')).not.toBeInTheDocument();
  });

  // ------------------------------------------------------------------
  // Accessibility
  // ------------------------------------------------------------------

  it('has a live-region container so screen readers announce the message', () => {
    render(<FullPageSpinner message="Please wait…" />);

    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveAttribute('aria-live', 'polite');
  });

  it('hides the decorative spinner from the accessibility tree', () => {
    const { container } = render(<FullPageSpinner />);

    // The spinning div is the first child inside the status container
    const spinner = container.querySelector('[aria-hidden="true"]');
    expect(spinner).toBeInTheDocument();
  });

  // ------------------------------------------------------------------
  // Structure
  // ------------------------------------------------------------------

  it('renders the spinner element with the expected animation class', () => {
    const { container } = render(<FullPageSpinner />);

    const spinner = container.querySelector('[aria-hidden="true"]');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('uses consistent border styling (border-4 border-t-transparent)', () => {
    const { container } = render(<FullPageSpinner />);

    const spinner = container.querySelector('[aria-hidden="true"]');
    expect(spinner).toHaveClass('border-4', 'border-t-transparent');
  });
});
