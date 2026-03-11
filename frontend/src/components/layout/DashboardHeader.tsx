'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Settings, LogOut, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/contexts/AuthContext';

/**
 * Header pill — fixed top-right, aligned with the content right edge.
 *
 * Contains the notification bell and profile dropdown (Profile,
 * Settings, Sign Out). Uses backdrop-blur for a glassmorphic look
 * over the gradient background. Stays visible while scrolling.
 */
export default function DashboardHeader() {
  const { user, signOut } = useAuthContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close the dropdown when clicking outside.
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const email = user?.email ?? '';
  const initial = email.charAt(0).toUpperCase() || '?';

  return (
    <header className="fixed top-4 right-6 z-30 lg:right-10">
      <div className="flex h-14 items-center gap-2 rounded-2xl bg-white/60 px-3 backdrop-blur-md">
        {/* Notification bell */}
        <button
          type="button"
          aria-label="Notifications"
          className="relative rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
        >
          <Bell className="h-5 w-5" />
          <span
            className="bg-blush-500 absolute top-1.5 right-1.5 h-2 w-2 rounded-full"
            aria-hidden="true"
          />
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

          {menuOpen && (
            <div className="absolute right-0 z-50 mt-2 w-52 origin-top-right rounded-xl bg-white/90 py-1 shadow-lg shadow-slate-200/40 backdrop-blur-md">
              <Link
                href="/dashboard/settings"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50"
              >
                <Settings className="h-4 w-4 text-slate-400" aria-hidden="true" />
                Settings
              </Link>
              <div className="my-1 border-t border-slate-100" />
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  signOut();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
