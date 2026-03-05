/**
 * Tests for the Login page.
 *
 * Covers three areas:
 * 1. **Session precheck** — spinner vs form based on auth context state.
 * 2. **Form submission** — successful sign-in and error display.
 * 3. **Accessibility** — label-input linking, aria attributes, password toggle.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '@/app/auth/login/page';

// ------------------------------------------------------------------ mocks ---

const mockPush = jest.fn();
const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/auth/login',
  useSearchParams: () => mockSearchParams(),
}));

const mockSignIn = jest.fn();
const mockUseAuthContext = jest.fn();

jest.mock('@/contexts/AuthContext', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

// ----------------------------------------------------------------- helpers ---

/** Builds a minimal return value for useAuthContext. */
function authState(overrides: Record<string, unknown> = {}) {
  return {
    user: null,
    session: null,
    loading: false,
    signIn: mockSignIn,
    signUp: jest.fn(),
    signOut: jest.fn(),
    getAccessToken: jest.fn(),
    ...overrides,
  };
}

// ------------------------------------------------------------------- tests ---

describe('LoginPage — session precheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the spinner while authLoading is true', () => {
    mockUseAuthContext.mockReturnValue(authState({ loading: true }));

    render(<LoginPage />);

    expect(screen.getByText('Checking session…')).toBeInTheDocument();
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });

  it('shows the spinner when a user already exists (redirect pending)', () => {
    mockUseAuthContext.mockReturnValue(authState({ user: { id: 'u1', email: 'a@b.com' } }));

    render(<LoginPage />);

    expect(screen.getByText('Checking session…')).toBeInTheDocument();
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });

  it('renders the login form once loading is false and user is null', () => {
    mockUseAuthContext.mockReturnValue(authState());

    render(<LoginPage />);

    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.queryByText('Checking session…')).not.toBeInTheDocument();
  });

  it('redirects to /dashboard when user exists', () => {
    mockUseAuthContext.mockReturnValue(authState({ user: { id: 'u1', email: 'a@b.com' } }));

    render(<LoginPage />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to returnUrl when user exists and returnUrl is set', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams('returnUrl=/dashboard/settings'));
    mockUseAuthContext.mockReturnValue(authState({ user: { id: 'u1', email: 'a@b.com' } }));

    render(<LoginPage />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard/settings');
  });
});

describe('LoginPage — form submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.mockReturnValue(new URLSearchParams());
    mockUseAuthContext.mockReturnValue(authState());
  });

  it('calls signIn and redirects to /dashboard on success', async () => {
    const user = userEvent.setup();
    mockSignIn.mockResolvedValueOnce(undefined);

    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'me@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('me@example.com', 'secret123');
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows an error message when signIn rejects', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new Error('Invalid credentials'));

    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'me@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrong');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Invalid credentials');
  });

  it('shows loading text while the request is in flight', async () => {
    const user = userEvent.setup();
    // Never resolve — stays loading
    mockSignIn.mockReturnValueOnce(new Promise(() => {}));

    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'me@example.com');
    await user.type(screen.getByLabelText('Password'), 'secret123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});

describe('LoginPage — accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSearchParams.mockReturnValue(new URLSearchParams());
    mockUseAuthContext.mockReturnValue(authState());
  });

  it('links labels to inputs via htmlFor / id', () => {
    render(<LoginPage />);

    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'login-email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'login-password');
  });

  it('toggles password visibility', async () => {
    const user = userEvent.setup();
    render(<LoginPage />);

    const passwordInput = screen.getByLabelText('Password');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByLabelText('Show password'));
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByLabelText('Hide password'));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('sets aria-describedby on inputs when an error is shown', async () => {
    const user = userEvent.setup();
    mockSignIn.mockRejectedValueOnce(new Error('Bad creds'));

    render(<LoginPage />);

    await user.type(screen.getByLabelText('Email'), 'a@b.com');
    await user.type(screen.getByLabelText('Password'), 'x');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await screen.findByRole('alert');

    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-describedby', 'login-error');
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-describedby', 'login-error');
  });
});
