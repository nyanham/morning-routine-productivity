/**
 * Tests for the Entries page's loading lifecycle and delete flow.
 *
 * We mock the three API hooks (`useRoutines`, `useProductivity`,
 * `useUserProfile`) so we can control their `loading` / `data` /
 * `error` state and verify that:
 * 1. The calendar skeleton renders while data is loading.
 * 2. The real calendar appears once fetches resolve.
 * 3. An error banner shows when a hook reports an error.
 * 4. The delete dialog renders and can confirm / cancel.
 */

import { render, screen, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// ------------------------------------------------------------------ mocks ---

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

// lucide-react — proxy stub for all icons
jest.mock(
  'lucide-react',
  () =>
    new Proxy(
      {},
      {
        get: (_target, prop) => {
          if (typeof prop !== 'string') return undefined;
          const Icon = (props: Record<string, unknown>) => (
            <span data-testid={`icon-${prop}`} {...props} />
          );
          Icon.displayName = String(prop);
          return Icon;
        },
      }
    )
);

// ---- API hook mocks -------------------------------------------------------

interface MockHookState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fetch: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  remove: jest.Mock;
}

interface PaginatedData<T> {
  data: T[];
  total: number;
}

let mockRoutines: MockHookState<PaginatedData<MockRoutine>>;
let mockProductivity: MockHookState<PaginatedData<MockProductivity>>;
let mockProfile: MockHookState<{ locale?: string }>;

interface MockRoutine {
  id: string;
  date: string;
  wake_up_time: string;
  sleep_duration: number;
  exercise_done: boolean;
  exercise_duration_minutes: number;
  healthy_breakfast: boolean;
  mood: string;
  notes?: string;
}

interface MockProductivity {
  id: string;
  date: string;
  productivity_score: number;
}

/**
 * Build sample entries whose date falls inside the current month
 * so the calendar will actually render them.  Day 15 is always
 * safe (every month has at least 15 days).
 */
const NOW = new Date();
const SAMPLE_YEAR = NOW.getFullYear();
const SAMPLE_MONTH = NOW.getMonth(); // 0-indexed
const SAMPLE_DATE_STR = `${SAMPLE_YEAR}-${String(SAMPLE_MONTH + 1).padStart(2, '0')}-15`;

const SAMPLE_ROUTINE: MockRoutine = {
  id: 'r1',
  date: SAMPLE_DATE_STR,
  wake_up_time: '06:30',
  sleep_duration: 7.5,
  exercise_done: true,
  exercise_duration_minutes: 30,
  healthy_breakfast: true,
  mood: 'happy',
  notes: 'Good morning',
};

const SAMPLE_PRODUCTIVITY: MockProductivity = {
  id: 'p1',
  date: SAMPLE_DATE_STR,
  productivity_score: 8,
};

/** Formatted version of SAMPLE_DATE_STR as produced by formatDate(). */
const FORMATTED_SAMPLE_DATE = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
}).format(new Date(SAMPLE_DATE_STR));

function resetHooks() {
  mockRoutines = {
    data: null,
    loading: false,
    error: null,
    fetch: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };
  mockProductivity = {
    data: null,
    loading: false,
    error: null,
    fetch: jest.fn().mockResolvedValue(undefined),
    create: jest.fn().mockResolvedValue(undefined),
    update: jest.fn().mockResolvedValue(undefined),
    remove: jest.fn().mockResolvedValue(undefined),
  };
  mockProfile = {
    data: null,
    loading: false,
    error: null,
    fetch: jest.fn().mockResolvedValue(undefined),
    create: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };
}

jest.mock('@/hooks/useApi', () => ({
  useRoutines: () => mockRoutines,
  useProductivity: () => mockProductivity,
  useUserProfile: () => mockProfile,
}));

// ------------------------------------------------------------------ import ---

import EntriesPage from '@/app/dashboard/entries/page';

// ------------------------------------------------------------------- tests ---

describe('EntriesPage — loading lifecycle', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetHooks();
  });

  it('shows the calendar skeleton during the initial load', async () => {
    // No data, but loading is true → isInitialLoad = true
    mockRoutines.loading = true;
    mockProductivity.loading = true;

    let resolveFetches!: () => void;
    const pending = new Promise<void>((r) => {
      resolveFetches = r;
    });
    mockRoutines.fetch = jest.fn(() => pending);
    mockProductivity.fetch = jest.fn(() => pending);

    render(<EntriesPage />);

    // Skeleton must have role="status" and the sr-only text
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText('Loading calendar…')).toBeInTheDocument();

    // Clean up pending promises
    await act(async () => {
      resolveFetches();
    });
  });

  it('hides the skeleton and shows the calendar when data loads', async () => {
    mockRoutines.data = { data: [SAMPLE_ROUTINE], total: 1 };
    mockProductivity.data = { data: [SAMPLE_PRODUCTIVITY], total: 1 };

    await act(async () => {
      render(<EntriesPage />);
    });

    // Skeleton gone
    expect(screen.queryByRole('status')).toBeNull();

    // Calendar grid should be visible (day-of-week headers)
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Sun')).toBeInTheDocument();
  });

  it('displays an error banner when the routines hook reports an error', async () => {
    mockRoutines.error = 'Network failure';
    mockRoutines.data = { data: [], total: 0 };
    mockProductivity.data = { data: [], total: 0 };

    await act(async () => {
      render(<EntriesPage />);
    });

    const alert = screen.getByRole('alert');
    expect(alert).toBeInTheDocument();
    expect(within(alert).getByText('Error loading entries')).toBeInTheDocument();
    expect(within(alert).getByText('Network failure')).toBeInTheDocument();
  });

  it('displays an error banner when the productivity hook reports an error', async () => {
    mockProductivity.error = 'Server error';
    mockRoutines.data = { data: [], total: 0 };
    mockProductivity.data = { data: [], total: 0 };

    await act(async () => {
      render(<EntriesPage />);
    });

    const alert = screen.getByRole('alert');
    expect(within(alert).getByText('Error loading entries')).toBeInTheDocument();
    expect(within(alert).getByText('Server error')).toBeInTheDocument();
  });

  it('calls routines and productivity fetch on mount', async () => {
    mockRoutines.data = { data: [], total: 0 };
    mockProductivity.data = { data: [], total: 0 };

    await act(async () => {
      render(<EntriesPage />);
    });

    expect(mockRoutines.fetch).toHaveBeenCalledTimes(1);
    expect(mockProductivity.fetch).toHaveBeenCalledTimes(1);
    expect(mockProfile.fetch).toHaveBeenCalledTimes(1);
  });

  it('passes date-range params for the current month to fetch', async () => {
    mockRoutines.data = { data: [], total: 0 };
    mockProductivity.data = { data: [], total: 0 };

    await act(async () => {
      render(<EntriesPage />);
    });

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const endDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    expect(mockRoutines.fetch).toHaveBeenCalledWith(
      expect.objectContaining({ startDate, endDate, page: 1, pageSize: 100 })
    );
    expect(mockProductivity.fetch).toHaveBeenCalledWith(
      expect.objectContaining({ startDate, endDate, page: 1, pageSize: 100 })
    );
  });
});

describe('EntriesPage — delete confirmation flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetHooks();
    mockRoutines.data = { data: [SAMPLE_ROUTINE], total: 1 };
    mockProductivity.data = { data: [SAMPLE_PRODUCTIVITY], total: 1 };
  });

  /**
   * Helper: open the detail panel by clicking the day-15 entry cell,
   * then click the "Delete entry" icon to invoke the delete dialog.
   */
  async function openDeleteDialog(user: ReturnType<typeof userEvent.setup>) {
    // The day cell with an entry has an aria-label containing the
    // formatted date and productivity score (e.g. "Mar 15, 2026,
    // productivity 8 out of 10").
    const entryButton = screen.getByRole('button', {
      name: new RegExp(FORMATTED_SAMPLE_DATE),
    });
    await user.click(entryButton);

    // Detail panel now visible; click the "Delete entry" icon button
    const deleteButton = screen.getByRole('button', { name: /delete entry/i });
    await user.click(deleteButton);
  }

  it('shows the delete dialog when the delete icon is clicked', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<EntriesPage />);
    });

    await openDeleteDialog(user);

    const dialog = screen.getByRole('alertdialog');
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText('Delete entry?')).toBeInTheDocument();
  });

  it('dismisses the delete dialog when Cancel is clicked', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<EntriesPage />);
    });

    await openDeleteDialog(user);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(screen.queryByRole('alertdialog')).toBeNull();
  });

  it('calls remove and reloads entries when delete is confirmed', async () => {
    const user = userEvent.setup();

    await act(async () => {
      render(<EntriesPage />);
    });

    await openDeleteDialog(user);

    // The confirm button in the dialog says "Delete"
    const dialog = screen.getByRole('alertdialog');
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' });
    await user.click(confirmButton);

    expect(mockRoutines.remove).toHaveBeenCalledWith('r1');
    expect(mockProductivity.remove).toHaveBeenCalledWith('p1');
  });

  it('shows a delete error banner when remove fails', async () => {
    const user = userEvent.setup();
    mockRoutines.remove = jest.fn().mockRejectedValue(new Error('Delete failed'));

    await act(async () => {
      render(<EntriesPage />);
    });

    await openDeleteDialog(user);

    const dialog = screen.getByRole('alertdialog');
    const confirmButton = within(dialog).getByRole('button', { name: 'Delete' });
    await user.click(confirmButton);

    const alerts = screen.getAllByRole('alert');
    const deleteAlert = alerts.find((el) => within(el).queryAllByText('Delete failed').length > 0);
    expect(deleteAlert).toBeDefined();
  });
});
