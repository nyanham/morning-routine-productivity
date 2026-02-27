import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import Fireflies from './Fireflies';

/**
 * Full-width hero section shown at the top of the landing page.
 *
 * A large headline, one-liner description, and two CTAs (primary + ghost).
 * Background uses decorative gradient blobs plus animated Firefly
 * particles for a warm, morning-inspired feel.
 */
export default function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Animated blurred blobs — slowly appear, drift, and fade out */}
      <Fireflies count={8} />

      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        <div
          className="mx-auto max-w-3xl text-center"
          style={{ animation: 'reveal-up 0.8s ease-out both' }}
        >
          {/* Badge */}
          <div className="bg-aqua-100 text-aqua-800 mb-6 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            Free &amp; open-source
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl lg:text-6xl">
            Own Your Mornings, <span className="text-aqua-600">Own Your Day</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
            Log your morning routine, track productivity, and discover data-backed patterns that
            help you start every day at your best.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/auth/signup"
              className="bg-aqua-600 hover:bg-aqua-800 inline-flex items-center gap-2 rounded-xl px-7 py-3 text-base font-semibold text-white shadow-md transition-colors"
            >
              Start for Free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-7 py-3 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-100"
            >
              See How It Works
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
