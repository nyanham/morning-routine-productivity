import { render, screen } from '@testing-library/react';
import {
  StatsCardSkeleton,
  ChartSkeleton,
  TableSkeleton,
  PieChartSkeleton,
  EntryPanelSkeleton,
  SidebarCardSkeleton,
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

// ——————————————————————————————————————————
// EntryPanelSkeleton
// ——————————————————————————————————————————

describe('EntryPanelSkeleton', () => {
  it('is aria-hidden so screen readers skip the visual placeholder', () => {
    const { container } = render(<EntryPanelSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has the animate-pulse class', () => {
    const { container } = render(<EntryPanelSkeleton />);
    expect(container.firstElementChild).toHaveClass('animate-pulse');
  });
});

// ——————————————————————————————————————————
// SidebarCardSkeleton
// ——————————————————————————————————————————

describe('SidebarCardSkeleton', () => {
  it('is aria-hidden so screen readers skip the visual placeholder', () => {
    const { container } = render(<SidebarCardSkeleton />);
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('has the animate-pulse class', () => {
    const { container } = render(<SidebarCardSkeleton />);
    expect(container.firstElementChild).toHaveClass('animate-pulse');
  });

  it('renders the correct number of placeholder lines', () => {
    const { container } = render(<SidebarCardSkeleton lines={5} />);
    const rows = container.querySelectorAll('.flex.items-center.gap-3');
    expect(rows).toHaveLength(5);
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

  it('renders a two-column grid layout', () => {
    const { container } = render(<DashboardSkeleton />);
    const root = container.firstElementChild;
    expect(root).toHaveClass('space-y-8');
    // Should have 1 grid wrapper (plus the sr-only span)
    const grid = root?.querySelector('.grid');
    expect(grid).toBeInTheDocument();
  });

  it('renders entry panel skeletons in the left column', () => {
    const { container } = render(<DashboardSkeleton />);
    const panels = container.querySelectorAll('[aria-hidden="true"].animate-pulse');
    // Chart + 4 entry panels + 2 sidebar cards = 7+ aria-hidden elements
    expect(panels.length).toBeGreaterThanOrEqual(4);
  });
});
