/**
 * Tests for the Login page's session-precheck loading behaviour.
 *
 * We mock `useAuthContext` to control `loading` and `user`, then assert
 * that the spinner / form renders in the correct state.
 */

import { render, screen } from '@testing-library/react';
import LoginPage from '@/app/auth/login/page';

// ------------------------------------------------------------------ mocks ---

const mockPush = jest.fn();
const mockSearchParams = jest.fn(() => new URLSearchParams());

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/auth/login',
  useSearchParams: () => mockSearchParams(),
}));

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
    signIn: jest.fn(),
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
    // Override useSearchParams to include a returnUrl
    mockSearchParams.mockReturnValue(new URLSearchParams('returnUrl=/dashboard/settings'));

    mockUseAuthContext.mockReturnValue(authState({ user: { id: 'u1', email: 'a@b.com' } }));

    render(<LoginPage />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard/settings');
  });
});
