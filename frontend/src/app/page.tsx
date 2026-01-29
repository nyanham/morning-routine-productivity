import Link from 'next/link';
import { BarChart3, Upload, PenLine, Users } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-primary-600" />
              <span className="text-xl font-bold text-slate-900">
                Productivity Tracker
              </span>
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
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            Track Your Morning Routine,
            <br />
            <span className="text-primary-600">Boost Your Productivity</span>
          </h1>
          <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
            Analyze your morning habits and discover patterns that lead to more
            productive days. Import your data or track manually.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
            <Link
              href="/dashboard"
              className="btn-secondary text-lg px-8 py-3"
            >
              View Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Upload className="h-8 w-8 text-primary-600" />}
              title="CSV Import"
              description="Quickly import your existing data from CSV files. Bulk upload your morning routine history."
            />
            <FeatureCard
              icon={<PenLine className="h-8 w-8 text-primary-600" />}
              title="Manual Input"
              description="Log your daily routines manually with our intuitive interface. Track wake time, activities, and more."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-primary-600" />}
              title="Visual Analytics"
              description="Beautiful charts and graphs to visualize your productivity patterns over time."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
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
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600">{description}</p>
    </div>
  );
}
