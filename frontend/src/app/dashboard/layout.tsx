import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';

/**
 * Persistent dashboard route layout.
 *
 * Sidebar and Header live here so they are mounted once and never
 * re-render / re-animate when navigating between dashboard pages.
 * Individual pages still wrap their content in the `<DashboardLayout>`
 * component for the title and `<main>` container.
 */
export default function DashboardRouteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="from-aqua-100/40 min-h-screen bg-linear-to-br via-slate-50 to-sky-100/30">
      <Sidebar />
      <DashboardHeader />

      {/* pl-24 clears the sidebar; pr matches DashboardHeader right offset */}
      <div className="pr-6 pl-24 lg:pr-10">
        <div className="mx-auto max-w-350">{children}</div>
      </div>
    </div>
  );
}
