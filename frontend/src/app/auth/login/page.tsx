'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Sun, Eye, EyeOff } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import FullPageSpinner from '@/components/ui/FullPageSpinner';

/**
 * Inner login form wrapped by `<Suspense>` so `useSearchParams` works
 * correctly in a server-rendered tree.
 *
 * Visual language:
 * - Two-column layout on ≥md: left brand panel (aqua gradient) + right form card.
 * - Single centred card on mobile.
 * - Consistent with the MorningFlow landing-page palette and typography.
 *
 * Accessibility:
 * - Every `<label>` is linked to its input via `htmlFor`/`id`.
 * - Errors use `role="alert"` and `aria-describedby`.
 * - Password visibility toggle is keyboard-accessible with `aria-label`.
 */
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, user, loading: authLoading } = useAuthContext();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    }
  }, [user, router, searchParams]);

  // Show a loading spinner while we verify the session.
  // This avoids a flash of the login form when the user is already signed in.
  if (authLoading || user) {
    return <FullPageSpinner message="Checking session…" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signIn(email, password);
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      router.push(returnUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to sign in';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Brand panel (hidden on mobile) ── */}
      <div className="from-aqua-600 to-aqua-800 hidden flex-col justify-center bg-gradient-to-br px-12 md:flex md:w-2/5 lg:w-1/2">
        <Link href="/" className="mb-10 flex items-center gap-3">
          <Sun className="h-10 w-10 text-white/90" />
          <span className="text-2xl font-bold tracking-tight text-white">MorningFlow</span>
        </Link>
        <h2 className="max-w-md text-3xl leading-snug font-extrabold text-white lg:text-4xl">
          Own Your Mornings,
          <br />
          Own Your Day
        </h2>
        <p className="mt-4 max-w-sm text-base leading-relaxed text-white/80">
          Log your morning routine, track productivity, and discover data-backed patterns that help
          you start every day at your best.
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
            <h1 className="mb-6 text-center text-2xl font-bold text-slate-900">Welcome Back</h1>

            {error && (
              <div
                id="login-error"
                role="alert"
                className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="label">
                  Email
                </label>
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  aria-describedby={error ? 'login-error' : undefined}
                  className="input"
                />
              </div>

              <div>
                <label htmlFor="login-password" className="label">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    aria-describedby={error ? 'login-error' : undefined}
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

              <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-aqua-600 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<FullPageSpinner />}>
      <LoginForm />
    </Suspense>
  );
}
