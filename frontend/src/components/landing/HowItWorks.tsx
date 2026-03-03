import { ClipboardList, BarChart3, Lightbulb } from 'lucide-react';
import RevealSection from './RevealSection';

/**
 * "How It Works" section — a three-step visual explanation.
 *
 * Uses numbered steps with icons so visitors immediately understand
 * the value loop: log → analyse → improve.
 * Each step reveals with a staggered animation on scroll.
 */

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
}

function Step({ number, icon, title, description }: StepProps) {
  return (
    <div className="relative flex flex-col items-center text-center">
      {/* Step number badge */}
      <div className="bg-aqua-100 text-aqua-600 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm">
        {icon}
      </div>
      <span className="bg-blush-200 text-blush-800 absolute -top-2 right-1/2 translate-x-8 rounded-full px-2 py-0.5 text-xs font-bold">
        {number}
      </span>
      <h3 className="mt-1 text-lg font-semibold text-slate-800">{title}</h3>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-500">{description}</p>
    </div>
  );
}

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: <ClipboardList className="h-6 w-6" />,
      title: 'Log Your Morning',
      description:
        'Add a daily entry — wake time, sleep, exercise, mood, and more — or bulk-import from CSV.',
    },
    {
      number: 2,
      icon: <BarChart3 className="h-6 w-6" />,
      title: 'Explore Your Stats',
      description:
        'Interactive charts, filters, and correlations reveal what actually drives your productivity.',
    },
    {
      number: 3,
      icon: <Lightbulb className="h-6 w-6" />,
      title: 'Improve & Compare',
      description:
        'Track trends, set goals, and see how your habits stack up against anonymous community averages.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <RevealSection className="mx-auto max-w-2xl text-center">
          <p className="text-aqua-600 text-sm font-semibold tracking-wider uppercase">
            How It Works
          </p>
          <h2 className="mt-2 text-3xl font-bold text-slate-800 sm:text-4xl">Three Simple Steps</h2>
          <p className="mt-4 text-base text-slate-500">Getting started takes less than a minute.</p>
        </RevealSection>

        {/* Steps + connector */}
        <div className="relative mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
          {/* Decorative connector line (desktop only) */}
          <div
            aria-hidden="true"
            className="absolute top-7 right-1/6 left-1/6 hidden h-0.5 bg-slate-200 md:block"
          />

          {steps.map((s, i) => (
            <RevealSection key={s.number} delay={i * 150}>
              <Step {...s} />
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}
