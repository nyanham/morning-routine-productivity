import { Upload, PenLine, BarChart3, Filter, GitCompareArrows, Shield } from 'lucide-react';
import RevealSection from './RevealSection';

/**
 * Feature grid showcasing the six main capabilities of MorningFlow.
 *
 * Each card has an icon (drawn in the Icy Aqua palette), a short title,
 * and a one-liner description. Cards animate in with a staggered delay
 * as they scroll into view.
 */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="bg-aqua-100 text-aqua-600 group-hover:bg-aqua-200 mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-colors">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

export default function Features() {
  const features: FeatureCardProps[] = [
    {
      icon: <PenLine className="h-5 w-5" />,
      title: 'Daily Entries',
      description:
        'Log your morning routine and productivity in one unified form — wake time, sleep, exercise, mood, focus, and more.',
    },
    {
      icon: <Upload className="h-5 w-5" />,
      title: 'CSV Import',
      description:
        'Already tracking elsewhere? Bulk-import your history from a CSV file in seconds.',
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: 'Interactive Charts',
      description:
        'Beautiful line, bar, and scatter charts with drill-down. Group by day, week, or month.',
    },
    {
      icon: <Filter className="h-5 w-5" />,
      title: 'Powerful Filters',
      description:
        'Slice and dice your data by date range, metric, or custom tags to find exactly what matters.',
    },
    {
      icon: <GitCompareArrows className="h-5 w-5" />,
      title: 'Period Comparison',
      description:
        'Compare any two time periods side-by-side to measure real progress in your habits.',
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: 'Privacy First',
      description:
        'Community stats are always anonymous and aggregated. Your personal data is never shared.',
    },
  ];

  return (
    <section id="features" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <p className="text-aqua-600 text-sm font-semibold tracking-wider uppercase">Features</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 sm:text-4xl">
            Everything You Need to Build Better Mornings
          </h2>
          <p className="mt-4 text-base text-slate-500">
            Simple tools to capture data, and smart analytics to turn it into action.
          </p>
        </RevealSection>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <RevealSection key={f.title} animation="scale" delay={i * 100}>
              <FeatureCard {...f} />
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
