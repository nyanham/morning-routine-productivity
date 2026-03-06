import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';
import { Sun } from 'lucide-react';

/**
 * Dashboard shell layout.
 *
 * Structure:
 *   ┌─────────────────────────────────────────┐
 *   │ gradient background                     │
 *   │  ┌──┐                        ┌───────┐  │
 *   │  │  │ floating    scrollable  │bell+av│  │
 *   │  │  │ sidebar     main area   └───────┘  │
 *   │  └──┘                                    │
 *   └─────────────────────────────────────────┘
 *
 * Both sidebar and header float over a soft gradient background.
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-aqua-100/40 min-h-screen bg-gradient-to-br via-slate-50 to-sky-100/30">
      <Sidebar />
      <DashboardHeader />
      {/* pl-24 clears the sidebar capsules; pt-20 clears the header pill */}
      <main className="pt-20 pr-6 pb-10 pl-24 lg:pr-10">
        <div className="mx-auto max-w-[1400px]">
          {/* Page title — scrolls with content, aligned with the logo */}
          <div className="mb-8 flex items-center gap-3">
            <Sun className="text-aqua-500 h-7 w-7" aria-hidden="true" />
            <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
