import { Moon, Zap, TrendingUp, Users } from 'lucide-react';
import RevealSection from './RevealSection';

/**
 * A sneak-peek of anonymous community statistics.
 *
 * Shows four aggregate stat cards and a descriptive blurb so
 * visitors understand the social/comparison angle before signing up.
 * All numbers are illustrative placeholders — the real component
 * will fetch from the public community API.
 * Cards animate in with staggered scroll-reveal.
 */

interface StatBubbleProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  footnote: string;
}

function StatBubble({ icon, label, value, footnote }: StatBubbleProps) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="bg-aqua-100 text-aqua-600 mb-3 flex h-11 w-11 items-center justify-center rounded-full">
        {icon}
      </div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-extrabold text-slate-800">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{footnote}</p>
    </div>
  );
}

export default function CommunityPreview() {
  const stats = [
    {
      icon: <Moon className="h-5 w-5" />,
      label: 'Avg. Sleep',
      value: '7.1 h',
      footnote: 'across all users',
    },
    {
      icon: <Zap className="h-5 w-5" />,
      label: 'Avg. Productivity',
      value: '7.4',
      footnote: 'out of 10',
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      label: 'Most Productive Day',
      value: 'Tuesday',
      footnote: 'by avg. score',
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: 'Active Users',
      value: '1,200+',
      footnote: 'and growing',
    },
  ];

  return (
    <section id="community" className="bg-slate-800 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <RevealSection className="mx-auto max-w-2xl text-center">
          <p className="text-aqua-400 text-sm font-semibold tracking-wider uppercase">
            Community Insights
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
            See How Everyone Else Is Doing
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-100">
            Anonymous, aggregated data from all users — compare your habits without ever exposing
            personal information.
          </p>
        </RevealSection>

        {/* Stats grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <RevealSection key={s.label} animation="scale" delay={i * 120}>
              <StatBubble {...s} />
            </RevealSection>
          ))}
        </div>

        <RevealSection delay={500} className="mt-8 text-center">
          <p className="text-sm text-slate-200">
            Sign up to explore filterable, interactive community statistics.
          </p>
        </RevealSection>
      </div>
    </section>
  );
}
