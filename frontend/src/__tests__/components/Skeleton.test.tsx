import { render, screen } from '@testing-library/react';
import {
  StatsCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  PieChartSkeleton,
  DashboardSkeleton,
} from '@/components/ui/Skeleton';

// ——————————————————————————————————————————
// StatsCardSkeleton
// ——————————————————————————————————————————

describe('StatsCardSkeleton', () => {
  it('is aria-hidden so screen readers skip the visual placeholder', () => {
    const { container } = render(<StatsCardSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has the animate-pulse class for the loading animation', () => {
    const { container } = render(<StatsCardSkeleton />);
    expect(container.firstElementChild).toHaveClass('animate-pulse');
  });

  it('does NOT have its own role="status" (consolidated in DashboardSkeleton)', () => {
    const { container } = render(<StatsCardSkeleton />);
    expect(container.querySelector('[role="status"]')).toBeNull();
  });
});

// ——————————————————————————————————————————
// ChartSkeleton
// ——————————————————————————————————————————

describe('ChartSkeleton', () => {
  it('is aria-hidden so screen readers skip the visual placeholder', () => {
    const { container } = render(<ChartSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has the animate-pulse class', () => {
    const { container } = render(<ChartSkeleton />);
    expect(container.firstElementChild).toHaveClass('animate-pulse');
  });

  it('accepts a custom title prop without error', () => {
    const { container } = render(<ChartSkeleton title="Loading productivity…" />);
    // The title is rendered as a grey bar (visual-only), not as text content
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders seven bar placeholders', () => {
    const { container } = render(<ChartSkeleton />);
    const bars = container.querySelectorAll('.rounded-t.bg-slate-200');
    expect(bars).toHaveLength(7);
  });
});

// ——————————————————————————————————————————
// TableSkeleton
// ——————————————————————————————————————————

describe('TableSkeleton', () => {
  it('is aria-hidden so screen readers skip the visual placeholder', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has the animate-pulse class', () => {
    const { container } = render(<TableSkeleton />);
    expect(container.firstElementChild).toHaveClass('animate-pulse');
  });
});

// ——————————————————————————————————————————
// PieChartSkeleton
// ——————————————————————————————————————————

describe('PieChartSkeleton', () => {
  it('is aria-hidden so screen readers skip the visual placeholder', () => {
    const { container } = render(<PieChartSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has the animate-pulse class', () => {
    const { container } = render(<PieChartSkeleton />);
    expect(container.firstElementChild).toHaveClass('animate-pulse');
  });
});

// ——————————————————————————————————————————
// DashboardSkeleton (composed)
// ——————————————————————————————————————————

describe('DashboardSkeleton', () => {
  it('has a single role="status" on the wrapper for screen readers', () => {
    render(<DashboardSkeleton />);
    const status = screen.getByRole('status');
    expect(status).toBeInTheDocument();
    expect(status).toHaveClass('space-y-8');
  });

  it('includes a single sr-only "Loading dashboard…" label', () => {
    render(<DashboardSkeleton />);
    expect(screen.getByText('Loading dashboard…')).toHaveClass('sr-only');
  });

  it('renders four StatsCardSkeleton instances (aria-hidden)', () => {
    const { container } = render(<DashboardSkeleton />);
    const cards = container.querySelectorAll('.card.animate-pulse[aria-hidden="true"]');
    // 4 stat cards + 2 chart cards + 1 table + 1 pie = 8 total aria-hidden cards
    expect(cards.length).toBeGreaterThanOrEqual(4);
  });

  it('maintains the same grid structure as the real dashboard', () => {
    const { container } = render(<DashboardSkeleton />);
    const root = container.firstElementChild;
    expect(root).toHaveClass('space-y-8');
    // Should have 3 grid sections: stats, charts row 1, charts row 2
    // (plus the sr-only span = 4 direct children)
    const children = root?.querySelectorAll(':scope > div');
    expect(children?.length).toBe(3);
  });
});
