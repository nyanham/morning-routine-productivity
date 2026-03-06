'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Settings, LogOut, User, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Top header bar for the dashboard — sits above the main content area.
 *
 * Right side contains:
 *   1. Notification bell (placeholder — no backend yet)
 *   2. Profile button that opens a dropdown with Settings and Sign Out
 *
 * Inspired by the medical-dashboard reference the team shared: compact,
 * clean, and with a light border separating it from the page body.
 */
export default function DashboardHeader() {
  const { user, signOut } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside of it.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Extract initials (first letter of email local-part as fallback).
  const email = user?.email ?? '';
  const initial = email.charAt(0).toUpperCase() || '?';

  return (
    <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
      {/* Left — optional breadcrumb slot (kept empty for now) */}
      <div />

      {/* Right — notifications + profile */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell className="h-5 w-5" />
          {/* Unread dot — always visible as a placeholder for now */}
          <span className="bg-blush-500 absolute top-1.5 right-1.5 h-2 w-2 rounded-full" />
        </button>

        {/* Profile dropdown */}
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100"
          >
            {/* Avatar circle */}
            <span className="bg-aqua-100 text-aqua-700 flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold">
              {initial}
            </span>
            <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-700 sm:inline">
              {email}
            </span>
            <ChevronDown
              className={cn(
                'h-4 w-4 text-slate-400 transition-transform',
                menuOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown */}
          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
            >
              {/* Profile link */}
              <Link
                href="/dashboard/profile"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <User className="h-4 w-4 text-slate-400" />
                Profile
              </Link>

              {/* Settings link */}
              <Link
                href="/dashboard/settings"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                Settings
              </Link>

              <div className="my-1 border-t border-slate-100" />

              {/* Sign out */}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
