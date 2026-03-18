interface DashboardLayoutProps {
  children: React.ReactNode;
  /** When provided, renders as the page-level `<h1>` above the content area. */
  title?: string;
}

/**
 * Dashboard content wrapper.
 *
 * Renders the optional page title and a `<main>` container.
 * The persistent chrome (Sidebar, Header, background, outer padding)
 * is handled by the route-level `app/dashboard/layout.tsx`.
 */
export default function DashboardLayout({ children, title }: DashboardLayoutProps) {
  return (
    <>
      {title && (
        <h1 className="flex h-16 items-center pt-4 text-2xl font-bold text-slate-800">{title}</h1>
      )}

      {/* Page content */}
      <main className="mt-6 pb-10">{children}</main>
    </>
  );
}
