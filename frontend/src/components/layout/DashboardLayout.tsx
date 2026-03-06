import Sidebar from './Sidebar';
import DashboardHeader from './DashboardHeader';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="ml-64 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
