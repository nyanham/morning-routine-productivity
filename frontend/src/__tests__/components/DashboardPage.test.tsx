/**
 * Tests for the Dashboard page's loading lifecycle.
 *
 * We mock the three API hooks (`useRoutines`, `useProductivity`,
 * `useAnalyticsSummary`) so we can control their `loading` / `data`
 * state and verify that:
 * 1. The skeleton is rendered while data is being fetched.
 * 2. The real content (stats, charts, table) appears once fetches resolve.
 * 3. An error banner is shown when a hook reports an error.
 *
 * Expensive third-party components (recharts, lucide icons) are replaced
 * with lightweight stubs to keep test execution fast and focused.
 */

import { render, screen, act } from '@testing-library/react';

// ------------------------------------------------------------------ mocks ---

// RequireAuth & DashboardLayout — pass children through unchanged
jest.mock('@/contexts/AuthContext', () => ({
  RequireAuth: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useAuthContext: () => ({
    user: { id: '1' },
    session: null,
    loading: false,
    signIn: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getAccessToken: jest.fn().mockResolvedValue('tok'),
  }),
}));

jest.mock('@/components/layout/DashboardLayout', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Chart components — simple stubs that render a data-testid
jest.mock('@/components/charts', () => ({
  ProductivityChart: () => <div data-testid="productivity-chart" />,
  RoutineBarChart: () => <div data-testid="routine-chart" />,
  SleepDistributionChart: () => <div data-testid="sleep-chart" />,
}));

// lucide-react icons — plain spans.  We use a Proxy so every named
// import resolves to a stub component, avoiding "undefined" errors when
// StatsCard or other components import icons we didn't list manually.
jest.mock(
  'lucide-react',
  () =>
    new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop !== 'string') return undefined;
          // Return a tiny functional component named after the icon
          const Icon = () => <span>{String(prop)}</span>;
          Icon.displayName = String(prop);
          return Icon;
        },
      }
    )
);

// ---- API hook mocks ---------------------------------------------------

/**
 * Each mock hook tracks its own `loading`, `data`, and `error` state.
 * The `fetch` function is a jest.fn() that — when called — can either
 * resolve (updating data) or reject (setting error) based on the
 * scenario configured in each test.
 */

interface MockHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetch: jest.Mock;
}

let mockRoutines: MockHookState<{ data: never[]; total: number }>;
let mockProductivity: MockHookState<{ data: never[]; total: number }>;
let mockSummary: MockHookState<{
  avg_productivity: number | null;
  avg_sleep: number | null;
  avg_exercise: number | null;
  total_entries: number;
  productivity_trend: string | null;
}>;

/** Reset all hooks to their "loading" initial state. */
function resetHooks() {
  mockRoutines = {
    data: null,
    loading: false,
    error: null,
    fetch: jest.fn().mockResolvedValue(undefined),
  };
  mockProductivity = {
    data: null,
    loading: false,
    error: null,
    fetch: jest.fn().mockResolvedValue(undefined),
  };
  mockSummary = {
    data: null,
    loading: false,
    error: null,
    fetch: jest.fn().mockResolvedValue(undefined),
  };
}

jest.mock('@/hooks/useApi', () => ({
  useRoutines: () => mockRoutines,
  useProductivity: () => mockProductivity,
  useAnalyticsSummary: () => mockSummary,
}));

// ------------------------------------------------------------------ import ---

import DashboardPage from '@/app/dashboard/page';

// ------------------------------------------------------------------- tests ---

describe('DashboardPage — loading lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetHooks();
  });

  it('shows the skeleton while the initial fetch cycle is in progress', async () => {
    // Hooks start with loading=false and data=null.  The component's
    // `initialLoad` state begins as true.  Until Promise.allSettled
    // resolves, the skeleton must be visible.

    // Keep the fetch promises unresolved so initialLoad stays true.
    let resolveFetches!: () => void;
    const pending = new Promise<void>((r) => {
      resolveFetches = r;
    });
    mockRoutines.fetch = jest.fn(() => pending);
    mockProductivity.fetch = jest.fn(() => pending);
    mockSummary.fetch = jest.fn(() => pending);

    render(<DashboardPage />);

    // Skeleton must be present (single role="status" wrapper)
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading dashboard…')).toBeInTheDocument();

    // Real content must NOT be present yet
    expect(screen.queryByText('Avg. Productivity')).toBeNull();

    // Cleanup: resolve the pending fetches to avoid act() warnings
    await act(async () => {
      resolveFetches();
    });
  });

  it('hides the skeleton and shows stats after fetches resolve', async () => {
    // Fetches resolve immediately — the component transitions from
    // initialLoad=true → false on the next micro-task.
    mockRoutines.data = { data: [], total: 0 };
    mockProductivity.data = { data: [], total: 0 };
    mockSummary.data = {
      avg_productivity: 7.5,
      avg_sleep: 7.2,
      avg_exercise: 30,
      total_entries: 12,
      productivity_trend: 'up',
    };

    await act(async () => {
      render(<DashboardPage />);
    });

    // Skeleton should be gone
    expect(screen.queryByRole('status')).toBeNull();

    // Stats cards should be visible
    expect(screen.getByText('Avg. Productivity')).toBeInTheDocument();
    expect(screen.getByText('Avg. Sleep')).toBeInTheDocument();
    expect(screen.getByText('Total Entries')).toBeInTheDocument();
    expect(screen.getByText('Avg. Exercise')).toBeInTheDocument();
  });

  it('renders the "No data yet" banner when fetches resolve with no data', async () => {
    mockRoutines.data = { data: [], total: 0 };
    mockProductivity.data = { data: [], total: 0 };
    mockSummary.data = {
      avg_productivity: null,
      avg_sleep: null,
      avg_exercise: null,
      total_entries: 0,
      productivity_trend: null,
    };

    await act(async () => {
      render(<DashboardPage />);
    });

    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('shows the error banner when a hook reports an error', async () => {
    mockRoutines.error = 'Network failure';
    // Ensure the component doesn't stay in initialLoad
    mockRoutines.data = { data: [], total: 0 };
    mockProductivity.data = { data: [], total: 0 };
    mockSummary.data = {
      avg_productivity: null,
      avg_sleep: null,
      avg_exercise: null,
      total_entries: 0,
      productivity_trend: null,
    };

    await act(async () => {
      render(<DashboardPage />);
    });

    expect(screen.getByText('Error loading data')).toBeInTheDocument();
    expect(screen.getByText('Network failure')).toBeInTheDocument();
  });

  it('transitions from skeleton to loaded content when fetches resolve', async () => {
    // Start with pending fetches so the skeleton is shown initially.
    let resolveFetches!: () => void;
    const pending = new Promise<void>((r) => {
      resolveFetches = r;
    });
    mockRoutines.fetch = jest.fn(() => pending);
    mockProductivity.fetch = jest.fn(() => pending);
    mockSummary.fetch = jest.fn(() => pending);

    const { rerender } = render(<DashboardPage />);

    // Skeleton visible while fetches are pending
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByText('Avg. Productivity')).toBeNull();

    // Simulate fetches resolving and data becoming available
    mockRoutines.data = { data: [], total: 0 };
    mockProductivity.data = { data: [], total: 0 };
    mockSummary.data = {
      avg_productivity: 8.0,
      avg_sleep: 7.0,
      avg_exercise: 25,
      total_entries: 5,
      productivity_trend: 'up',
    };

    await act(async () => {
      resolveFetches();
    });

    rerender(<DashboardPage />);

    // Skeleton gone, real content visible
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Avg. Productivity')).toBeInTheDocument();
    expect(screen.getByText('Avg. Sleep')).toBeInTheDocument();
  });

  it('calls all three fetch functions on mount', async () => {
    await act(async () => {
      render(<DashboardPage />);
    });

    expect(mockRoutines.fetch).toHaveBeenCalledTimes(1);
    expect(mockProductivity.fetch).toHaveBeenCalledTimes(1);
    expect(mockSummary.fetch).toHaveBeenCalledTimes(1);
  });

  it('shows the skeleton during a manual refresh and hides it when fetches resolve', async () => {
    // First, let the initial load cycle complete so we start with real content.
    mockRoutines.data = { data: [], total: 0 };
    mockProductivity.data = { data: [], total: 0 };
    mockSummary.data = {
      avg_productivity: 7.5,
      avg_sleep: 7.2,
      avg_exercise: 30,
      total_entries: 12,
      productivity_trend: 'up',
    };

    await act(async () => {
      render(<DashboardPage />);
    });

    // Content should be visible, skeleton gone.
    expect(screen.queryByRole('status')).toBeNull();
    expect(screen.getByText('Avg. Productivity')).toBeInTheDocument();

    // Set up pending promises so the refresh keeps the skeleton visible.
    // Use mockImplementation on the *existing* mock references (the component
    // destructured these at render time, so replacing the object property
    // wouldn't affect the already-captured reference).
    let resolveRefresh!: () => void;
    const pendingRefresh = new Promise<void>((r) => {
      resolveRefresh = r;
    });
    mockRoutines.fetch.mockImplementation(() => pendingRefresh);
    mockProductivity.fetch.mockImplementation(() => pendingRefresh);
    mockSummary.fetch.mockImplementation(() => pendingRefresh);

    // Click the Refresh button
    await act(async () => {
      screen.getByRole('button', { name: /refresh/i }).click();
    });

    // Skeleton should reappear during the refresh.
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading dashboard…')).toBeInTheDocument();

    // Resolve the refresh fetches
    await act(async () => {
      resolveRefresh();
    });

    // Skeleton should disappear again.
    expect(screen.queryByRole('status')).toBeNull();
  });
});
