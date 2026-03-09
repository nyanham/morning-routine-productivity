import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

/**
 * Dashboard shell layout.
 *
 * ┌────────────────────────────────────────────┐
 * │  ┌───┐                       ┌────────┐ │
 * │  │ ☀ │ Dashboard (scrolls)  │ bell+av │ │  ← fixed
 * │  └───┘                       └────────┘ │
 * │  ┌──┐                                  │
 * │  │  │  scrollable main content         │
 * │  └──┘  (same grid alignment)           │
 * └────────────────────────────────────────────┘
 *
 * - Sidebar + logo: fixed left
 * - Header pill: fixed top-right, aligned with content right edge
 * - "Dashboard" title: outside logo capsule, scrolls with content
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-aqua-100/40 min-h-screen bg-gradient-to-br via-slate-50 to-sky-100/30">
      <Sidebar />
      <DashboardHeader />

      {/* pl-24 clears the sidebar; pt-4 aligns title row with logo */}
      <div className="pr-6 pl-24 lg:pr-10">
        <div className="mx-auto max-w-[1400px]">
          {/* Title — sits to the right of the fixed logo, scrolls with page */}
          <h1 className="flex h-16 items-center pt-4 text-2xl font-bold text-slate-800">
            Dashboard
          </h1>

          {/* Page content */}
          <main className="mt-6 pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
