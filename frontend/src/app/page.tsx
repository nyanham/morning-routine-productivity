import Link from 'next/link';
import { BarChart3, Upload, PenLine, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="text-primary-600 h-8 w-8" />
              <span className="text-xl font-bold text-slate-900">Productivity Tracker</span>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/auth/login" className="btn-secondary">
                Login
              </Link>
              <Link href="/auth/signup" className="btn-primary">
                Sign Up
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold text-slate-900">
            Track Your Morning Routine,
            <br />
            <span className="text-primary-600">Boost Your Productivity</span>
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-slate-600">
            Analyze your morning habits and discover patterns that lead to more productive days.
            Import your data or track manually.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary px-8 py-3 text-lg">
              Get Started Free
            </Link>
            <Link href="/dashboard" className="btn-secondary px-8 py-3 text-lg">
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold text-slate-900">Features</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              icon={<Upload className="text-primary-600 h-8 w-8" />}
              title="CSV Import"
              description="Quickly import your existing data from CSV files. Bulk upload your morning routine history."
            />
            <FeatureCard
              icon={<PenLine className="text-primary-600 h-8 w-8" />}
              title="Manual Input"
              description="Log your daily routines manually with our intuitive interface. Track wake time, activities, and more."
            />
            <FeatureCard
              icon={<BarChart3 className="text-primary-600 h-8 w-8" />}
              title="Visual Analytics"
              description="Beautiful charts and graphs to visualize your productivity patterns over time."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <p>&copy; 2026 Morning Routine Productivity Tracker</p>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="card text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="mb-2 text-xl font-semibold text-slate-900">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
