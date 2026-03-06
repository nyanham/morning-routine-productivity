import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

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
      {/* pl-22 clears the sidebar capsules; pt-18 clears the header pill */}
      <main className="pt-18 pr-4 pb-8 pl-22 lg:pr-8">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}
