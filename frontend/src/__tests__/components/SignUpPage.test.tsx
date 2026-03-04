/**
 * Tests for the Signup page.
 *
 * Covers four areas:
 * 1. **Session precheck** — spinner vs form based on auth context state.
 * 2. **Client-side validation** — password mismatch, too short.
 * 3. **Form submission** — successful sign-up and API error display.
 * 4. **Accessibility** — label-input linking, aria attributes, password toggles.
 */

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignUpPage from '@/app/auth/signup/page';

// ------------------------------------------------------------------ mocks ---

const mockPush = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn(), prefetch: jest.fn() }),
  usePathname: () => '/auth/signup',
  useSearchParams: () => new URLSearchParams(),
}));

const mockSignUp = jest.fn();
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
    signUp: mockSignUp,
    signOut: jest.fn(),
    getAccessToken: jest.fn(),
    ...overrides,
  };
}

/** Fill the signup form with valid default values. */
async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: { name?: string; email?: string; password?: string; confirm?: string } = {}
) {
  const {
    name = 'Jane Doe',
    email = 'jane@example.com',
    password = 'secret123',
    confirm = 'secret123',
  } = overrides;

  if (name) await user.type(screen.getByLabelText('Full Name'), name);
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
  await user.type(screen.getByLabelText('Confirm Password'), confirm);
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

describe('SignUpPage — client-side validation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue(authState());
  });

  it('shows an error when passwords do not match', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await fillForm(user, { password: 'abcdefgh', confirm: 'different' });
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Passwords do not match');
    expect(mockSignUp).not.toHaveBeenCalled();
  });

  it('shows an error when password is shorter than 6 characters', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await fillForm(user, { password: '12345', confirm: '12345' });
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Password must be at least 6 characters');
    expect(mockSignUp).not.toHaveBeenCalled();
  });
});

describe('SignUpPage — form submission', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue(authState());
  });

  it('calls signUp and shows the success screen', async () => {
    const user = userEvent.setup();
    mockSignUp.mockResolvedValueOnce(undefined);

    render(<SignUpPage />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledWith('jane@example.com', 'secret123', 'Jane Doe');
    });

    expect(screen.getByText('Check Your Email')).toBeInTheDocument();
    expect(screen.getByText(/jane@example\.com/)).toBeInTheDocument();
  });

  it('shows an error message when signUp rejects', async () => {
    const user = userEvent.setup();
    mockSignUp.mockRejectedValueOnce(new Error('Email already registered'));

    render(<SignUpPage />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Email already registered');
  });

  it('shows loading text while the request is in flight', async () => {
    const user = userEvent.setup();
    mockSignUp.mockReturnValueOnce(new Promise(() => {}));

    render(<SignUpPage />);

    await fillForm(user);
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled();
  });
});

describe('SignUpPage — accessibility', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue(authState());
  });

  it('links labels to inputs via htmlFor / id', () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText('Full Name')).toHaveAttribute('id', 'signup-fullname');
    expect(screen.getByLabelText('Email')).toHaveAttribute('id', 'signup-email');
    expect(screen.getByLabelText('Password')).toHaveAttribute('id', 'signup-password');
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute('id', 'signup-confirm');
  });

  it('toggles password visibility for both password fields', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    const passwordInput = screen.getByLabelText('Password');
    const confirmInput = screen.getByLabelText('Confirm Password');

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    // Toggle password field
    await user.click(screen.getByLabelText('Show password'));
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle confirm field
    await user.click(screen.getByLabelText('Show password confirmation'));
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  it('sets aria-describedby on inputs when an error is shown', async () => {
    const user = userEvent.setup();
    render(<SignUpPage />);

    await fillForm(user, { password: 'abc', confirm: 'abc' });
    await user.click(screen.getByRole('button', { name: /sign up/i }));

    await screen.findByRole('alert');

    expect(screen.getByLabelText('Email')).toHaveAttribute('aria-describedby', 'signup-error');
    expect(screen.getByLabelText('Password')).toHaveAttribute('aria-describedby', 'signup-error');
    expect(screen.getByLabelText('Confirm Password')).toHaveAttribute(
      'aria-describedby',
      'signup-error'
    );
  });
});
