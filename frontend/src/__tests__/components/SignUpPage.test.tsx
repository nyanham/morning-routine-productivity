/**
 * Tests for the Signup page's session-precheck loading behaviour.
 *
 * We mock `useAuthContext` to control `loading` and `user`, then assert
 * that the spinner / form renders in the correct state.
 */

import { render, screen } from '@testing-library/react';
import SignUpPage from '@/app/auth/signup/page';

// ------------------------------------------------------------------ mocks ---

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/auth/signup',
  useSearchParams: () => new URLSearchParams(),
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

describe('SignUpPage — session precheck', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows the spinner while authLoading is true', () => {
    mockUseAuthContext.mockReturnValue(authState({ loading: true }));

    render(<SignUpPage />);

    expect(screen.getByText('Checking session…')).toBeInTheDocument();
    expect(screen.queryByText('Create Account')).not.toBeInTheDocument();
  });

  it('shows the spinner when a user already exists (redirect pending)', () => {
    mockUseAuthContext.mockReturnValue(authState({ user: { id: 'u1', email: 'a@b.com' } }));

    render(<SignUpPage />);

    expect(screen.getByText('Checking session…')).toBeInTheDocument();
    expect(screen.queryByText('Create Account')).not.toBeInTheDocument();
  });

  it('renders the signup form once loading is false and user is null', () => {
    mockUseAuthContext.mockReturnValue(authState());

    render(<SignUpPage />);

    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.queryByText('Checking session…')).not.toBeInTheDocument();
  });

  it('redirects to /dashboard when user exists', () => {
    mockUseAuthContext.mockReturnValue(authState({ user: { id: 'u1', email: 'a@b.com' } }));

    render(<SignUpPage />);

    expect(mockPush).toHaveBeenCalledWith('/dashboard');
  });
});
