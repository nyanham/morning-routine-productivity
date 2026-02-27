'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Sun } from 'lucide-react';

/**
 * Landing page header with logo, navigation, and auth links.
 *
 * On mobile a hamburger expands to a full-width menu.
 * The header becomes translucent with a backdrop blur so it feels
 * lightweight when the user scrolls over the hero illustration.
 */
export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ── Logo ── */}
        <Link href="/" className="flex items-center gap-2">
          <Sun className="text-aqua-600 h-7 w-7" />
          <span className="text-lg font-bold tracking-tight text-slate-800">MorningFlow</span>
        </Link>

        {/* ── Desktop nav ── */}
        <nav className="hidden items-center gap-6 md:flex">
          <a
            href="#features"
            className="hover:text-aqua-600 text-sm font-medium text-slate-600 transition-colors"
          >
            Features
          </a>
          <a
            href="#community"
            className="hover:text-aqua-600 text-sm font-medium text-slate-600 transition-colors"
          >
            Community
          </a>
          <a
            href="#how-it-works"
            className="hover:text-aqua-600 text-sm font-medium text-slate-600 transition-colors"
          >
            How It Works
          </a>
          <Link
            href="/auth/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-aqua-600 hover:bg-aqua-800 rounded-lg px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors"
          >
            Get Started
          </Link>
        </nav>

        {/* ── Mobile hamburger ── */}
        <button
          className="text-slate-700 md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* ── Mobile menu ── */}
      {mobileOpen && (
        <nav className="flex flex-col gap-3 border-t border-slate-100 bg-white px-4 pt-3 pb-4 md:hidden">
          <a
            href="#features"
            className="text-sm font-medium text-slate-600"
            onClick={() => setMobileOpen(false)}
          >
            Features
          </a>
          <a
            href="#community"
            className="text-sm font-medium text-slate-600"
            onClick={() => setMobileOpen(false)}
          >
            Community
          </a>
          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600"
            onClick={() => setMobileOpen(false)}
          >
            How It Works
          </a>
          <hr className="border-slate-100" />
          <Link
            href="/auth/login"
            className="text-sm font-medium text-slate-700"
            onClick={() => setMobileOpen(false)}
          >
            Log In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-aqua-600 rounded-lg px-5 py-2 text-center text-sm font-semibold text-white"
            onClick={() => setMobileOpen(false)}
          >
            Get Started
          </Link>
        </nav>
      )}
    </header>
  );
}
