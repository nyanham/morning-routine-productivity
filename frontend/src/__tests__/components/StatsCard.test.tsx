/**
 * Tests for StatsCard component.
 */

import { render, screen } from '@testing-library/react';
import StatsCard from '@/components/ui/StatsCard';

describe('StatsCard', () => {
  it('renders title and value', () => {
    render(<StatsCard title="Test Title" value="123" />);

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('123')).toBeInTheDocument();
  });

  it('renders numeric value', () => {
    render(<StatsCard title="Score" value={85} />);

    expect(screen.getByText('85')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(<StatsCard title="Tasks" value="5/6" subtitle="83% completion rate" />);

    expect(screen.getByText('83% completion rate')).toBeInTheDocument();
  });

  it('does not render subtitle when not provided', () => {
    render(<StatsCard title="Tasks" value="5" />);

    expect(screen.queryByText('completion')).not.toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const testIcon = <span data-testid="test-icon">📊</span>;
    render(<StatsCard title="Stats" value="10" icon={testIcon} />);

    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });

  it('renders trend information when provided', () => {
    render(<StatsCard title="Score" value="8" trend="up" trendValue="+12%" />);

    expect(screen.getByText('+12%')).toBeInTheDocument();
    expect(screen.getByText('vs last week')).toBeInTheDocument();
  });

  it('renders up trend with correct styling', () => {
    render(<StatsCard title="Score" value="8" trend="up" trendValue="+5%" />);

    const trendValue = screen.getByText('+5%');
    expect(trendValue).toHaveClass('text-green-600');
  });

  it('renders down trend with correct styling', () => {
    render(<StatsCard title="Score" value="8" trend="down" trendValue="-3%" />);

    const trendValue = screen.getByText('-3%');
    expect(trendValue).toHaveClass('text-red-600');
  });

  it('renders stable trend with correct styling', () => {
    render(<StatsCard title="Score" value="8" trend="stable" trendValue="0%" />);

    const trendValue = screen.getByText('0%');
    expect(trendValue).toHaveClass('text-slate-500');
  });

  it('does not render trend when trend prop is missing', () => {
    render(<StatsCard title="Score" value="8" trendValue="+5%" />);

    expect(screen.queryByText('vs last week')).not.toBeInTheDocument();
  });

  it('does not render trend when trendValue prop is missing', () => {
    render(<StatsCard title="Score" value="8" trend="up" />);

    expect(screen.queryByText('vs last week')).not.toBeInTheDocument();
  });

  it('applies correct CSS classes to the card', () => {
    const { container } = render(<StatsCard title="Test" value="1" />);

    expect(container.firstChild).toHaveClass('card');
  });

  it('renders title with correct styling', () => {
    render(<StatsCard title="My Title" value="100" />);

    const title = screen.getByText('My Title');
    expect(title).toHaveClass('text-sm', 'font-medium', 'text-slate-500');
  });

  it('renders value with correct styling', () => {
    render(<StatsCard title="Title" value="100" />);

    const value = screen.getByText('100');
    expect(value).toHaveClass('text-3xl', 'font-bold', 'text-slate-900');
  });
});
