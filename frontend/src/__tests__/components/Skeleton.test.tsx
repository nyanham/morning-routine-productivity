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
  it('renders with role="status" for accessibility', () => {
    render(<StatsCardSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has the animate-pulse class for the loading animation', () => {
    render(<StatsCardSkeleton />);
    const el = screen.getByRole('status');
    expect(el).toHaveClass('animate-pulse');
  });

  it('includes a sr-only loading label', () => {
    render(<StatsCardSkeleton />);
    expect(screen.getByText('Loading…')).toHaveClass('sr-only');
  });
});

// ——————————————————————————————————————————
// ChartSkeleton
// ——————————————————————————————————————————

describe('ChartSkeleton', () => {
  it('renders with role="status" for accessibility', () => {
    render(<ChartSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has the animate-pulse class', () => {
    render(<ChartSkeleton />);
    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });

  it('shows the default sr-only title', () => {
    render(<ChartSkeleton />);
    expect(screen.getByText('Loading chart…')).toHaveClass('sr-only');
  });

  it('accepts a custom title for the sr-only label', () => {
    render(<ChartSkeleton title="Loading productivity…" />);
    expect(screen.getByText('Loading productivity…')).toHaveClass('sr-only');
  });

  it('renders seven bar placeholders', () => {
    const { container } = render(<ChartSkeleton />);
    // The chart area has seven simulated bar divs
    const bars = container.querySelectorAll('.rounded-t.bg-slate-200');
    expect(bars).toHaveLength(7);
  });
});

// ——————————————————————————————————————————
// TableSkeleton
// ——————————————————————————————————————————

describe('TableSkeleton', () => {
  it('renders with role="status" for accessibility', () => {
    render(<TableSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has the animate-pulse class', () => {
    render(<TableSkeleton />);
    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });

  it('includes a sr-only loading label', () => {
    render(<TableSkeleton />);
    expect(screen.getByText('Loading recent entries…')).toHaveClass('sr-only');
  });
});

// ——————————————————————————————————————————
// PieChartSkeleton
// ——————————————————————————————————————————

describe('PieChartSkeleton', () => {
  it('renders with role="status" for accessibility', () => {
    render(<PieChartSkeleton />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('has the animate-pulse class', () => {
    render(<PieChartSkeleton />);
    expect(screen.getByRole('status')).toHaveClass('animate-pulse');
  });

  it('includes a sr-only loading label', () => {
    render(<PieChartSkeleton />);
    expect(screen.getByText('Loading chart…')).toHaveClass('sr-only');
  });
});

// ——————————————————————————————————————————
// DashboardSkeleton (composed)
// ——————————————————————————————————————————

describe('DashboardSkeleton', () => {
  it('renders four StatsCardSkeleton instances', () => {
    render(<DashboardSkeleton />);
    // StatsCardSkeleton each have aria-label="Loading statistic"
    const statCards = screen.getAllByLabelText('Loading statistic');
    expect(statCards).toHaveLength(4);
  });

  it('renders chart skeletons', () => {
    render(<DashboardSkeleton />);
    const charts = screen.getAllByLabelText('Loading chart');
    // 2 chart skeletons in row 1 + 1 pie chart skeleton in row 2 = 3
    expect(charts).toHaveLength(3);
  });

  it('renders a table skeleton', () => {
    render(<DashboardSkeleton />);
    const table = screen.getByLabelText('Loading table');
    expect(table).toBeInTheDocument();
  });

  it('maintains the same grid structure as the real dashboard', () => {
    const { container } = render(<DashboardSkeleton />);
    // Root wrapper
    const root = container.firstElementChild;
    expect(root).toHaveClass('space-y-8');
    // Should have 3 grid sections: stats, charts row 1, charts row 2
    const grids = root?.querySelectorAll(':scope > div');
    expect(grids?.length).toBe(3);
  });
});
