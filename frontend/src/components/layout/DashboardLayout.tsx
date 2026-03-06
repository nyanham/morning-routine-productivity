import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

/**
 * Dashboard shell layout.
 *
 * Structure (matching the medical-dashboard reference):
 *   ┌──────────────────────────────────────┐
 *   │  DashboardHeader (full-width, fixed) │
 *   ├────────┬─────────────────────────────┤
 *   │ Sidebar│       main content          │
 *   │ (icon  │       (scrollable)          │
 *   │  rail) │                             │
 *   └────────┴─────────────────────────────┘
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <DashboardHeader />
      <Sidebar />
      {/* pt-16 offsets the fixed header; pl-[72px] offsets the icon sidebar */}
      <main className="pt-16 pl-[72px]">
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
