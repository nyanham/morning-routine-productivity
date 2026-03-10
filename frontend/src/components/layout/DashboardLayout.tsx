import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** When provided, renders as the page-level `<h1>` above the content area. */
  title?: string;
}

/**
 * Dashboard shell layout.
 *
 * - Sidebar + logo: fixed left
 * - Header pill: fixed top-right, aligned with content right edge
 * - Optional title: rendered as h1 (pass `title` prop or let child pages render their own).
 */
export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <div className="from-aqua-100/40 min-h-screen bg-gradient-to-br via-slate-50 to-sky-100/30">
      <Sidebar />
      <DashboardHeader />

      {/* pl-24 clears the sidebar; pt-4 aligns title row with logo */}
      <div className="pr-6 pl-24 lg:pr-10">
        <div className="mx-auto max-w-[1400px]">
          {title && (
            <h1 className="flex h-16 items-center pt-4 text-2xl font-bold text-slate-800">
              {title}
            </h1>
          )}

          {/* Page content */}
          <main className="mt-6 pb-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
