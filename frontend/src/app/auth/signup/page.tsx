'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sun, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import FullPageSpinner from '@/components/ui/FullPageSpinner';

/**
 * Signup page with a two-column layout matching the login page.
 *
 * Visual language:
 * - Left brand panel (aqua gradient) + right form card on ≥md.
 * - Single centred card on mobile.
 *
 * Accessibility:
 * - Every `<label>` is linked to its input via `htmlFor`/`id`.
 * - Errors use `role="alert"` and `aria-describedby`.
 * - Password visibility toggles are keyboard-accessible with `aria-label`.
 */
export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { signUp, user, loading: authLoading } = useAuthContext();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  // Show a loading spinner while we verify the session.
  // This avoids a flash of the signup form when the user is already signed in.
  if (authLoading || user) {
    return <FullPageSpinner message="Checking session…" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, fullName);
      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign up';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="card w-full max-w-md text-center">
          <CheckCircle className="text-aqua-600 mx-auto mb-4 h-12 w-12" />
          <h1 className="mb-4 text-2xl font-bold text-slate-900">Check Your Email</h1>
          <p className="mb-6 text-slate-600">
            We&apos;ve sent a confirmation link to <span className="font-medium">{email}</span>.
            Please click the link to verify your account.
          </p>
          <Link href="/auth/login" className="btn-primary inline-block">
            Back to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* ── Brand panel (hidden on mobile) ── */}
      <div className="from-aqua-600 to-aqua-800 relative hidden flex-col justify-center overflow-hidden bg-gradient-to-br px-12 md:flex md:w-2/5 lg:w-1/2">
        {/* Decorative shapes — angular geometry conveying a fresh-start energy */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <div className="absolute -top-12 -right-12 h-52 w-52 rotate-45 rounded-md bg-white/10" />
          <div className="absolute -bottom-8 -left-8 h-40 w-40 rotate-12 border-2 border-white/15" />
          <div className="absolute top-1/4 right-10 h-16 w-16 rotate-45 bg-white/5" />
          <div className="absolute bottom-1/3 left-1/4 h-24 w-24 rotate-[30deg] border border-white/10" />
          <div className="absolute top-2/3 right-1/3 h-8 w-8 rotate-45 bg-white/15" />
          <div className="absolute top-12 right-1/4 h-0 w-0 border-r-[24px] border-b-[40px] border-l-[24px] border-r-transparent border-b-white/10 border-l-transparent" />
        </div>

        <Link href="/" className="relative mb-10 flex items-center gap-3">
          <Sun className="h-10 w-10 text-white/90" />
          <span className="text-2xl font-bold tracking-tight text-white">MorningFlow</span>
        </Link>
        <h2 className="relative max-w-md text-3xl leading-snug font-extrabold text-white lg:text-4xl">
          Start Tracking
          <br />
          in 60 Seconds
        </h2>
        <p className="relative mt-4 max-w-sm text-base leading-relaxed text-white/80">
          Create a free account, log your first morning, and let the data do the rest.
        </p>
      </div>

      {/* ── Form panel ── */}
      <div className="flex w-full items-center justify-center bg-slate-50 px-4 md:w-3/5 lg:w-1/2">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="mb-8 text-center md:hidden">
            <Link href="/" className="inline-flex items-center gap-2">
              <Sun className="text-aqua-600 h-9 w-9" />
              <span className="text-xl font-bold text-slate-800">MorningFlow</span>
            </Link>
          </div>

          {/* Card */}
          <div className="card">
            <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">Create Account</h1>

            {error && (
              <div
                id="signup-error"
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="signup-fullname" className="label">
                  Full Name
                </label>
                <input
                  id="signup-fullname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Jane Doe"
                  aria-describedby={error ? 'signup-error' : undefined}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="label">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  aria-describedby={error ? 'signup-error' : undefined}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="signup-password" className="label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="signup-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    aria-describedby={error ? 'signup-error' : undefined}
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="signup-confirm" className="label">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="signup-confirm"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    aria-describedby={error ? 'signup-error' : undefined}
                    className="input pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label={
                      showConfirm ? 'Hide password confirmation' : 'Show password confirmation'
                    }
                  >
                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Creating account…' : 'Sign Up'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-aqua-600 font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
