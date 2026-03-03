import Link from 'next/link';
import { Sun } from 'lucide-react';

/**
 * Site-wide footer for public pages.
 *
 * Three columns: brand summary, navigation links, and legal links.
 * Uses the Blue Slate palette for a calm, understated appearance.
 */
export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-slate-800 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          {/* ── Brand ── */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <Sun className="text-aqua-400 h-6 w-6" />
              <span className="text-lg font-bold text-white">MorningFlow</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Track your mornings, understand your habits, and unlock better days — backed by your
              own data.
            </p>
          </div>

          {/* ── Navigation ── */}
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Product
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="hover:text-aqua-400 transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#community" className="hover:text-aqua-400 transition-colors">
                  Community Stats
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-aqua-400 transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <Link href="/auth/signup" className="hover:text-aqua-400 transition-colors">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* ── Legal ── */}
          <div>
            <h4 className="mb-3 text-sm font-semibold tracking-wider text-slate-400 uppercase">
              Legal
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <span className="cursor-default text-slate-400">Privacy Policy</span>
              </li>
              <li>
                <span className="cursor-default text-slate-400">Terms of Service</span>
              </li>
            </ul>
          </div>
        </div>

        <hr className="my-8 border-slate-700" />

        <p className="text-center text-xs text-slate-500">
          &copy; {year} MorningFlow. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
