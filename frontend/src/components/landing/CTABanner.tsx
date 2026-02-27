import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import RevealSection from './RevealSection';

/**
 * Full-width call-to-action banner placed just before the footer.
 *
 * Uses the Icy Aqua gradient to draw attention and a single CTA button.
 * Content reveals on scroll for a polished feel.
 */
export default function CTABanner() {
  return (
    <section className="from-aqua-100 to-aqua-400 bg-linear-to-br py-16">
      <RevealSection className="mx-auto max-w-3xl px-4 text-center" animation="scale">
        <h2 className="text-3xl font-bold text-white sm:text-4xl">
          Ready to Transform Your Mornings?
        </h2>
        <p className="text-aqua-600 mx-auto mt-4 max-w-xl text-base leading-relaxed">
          Join thousands of people who are building data-driven morning routines. Free, open-source,
          and privacy-first.
        </p>
        <Link
          href="/auth/signup"
          className="text-aqua-800 hover:bg-aqua-100 mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3 text-base font-semibold shadow-md transition-colors"
        >
          Get Started — It&apos;s Free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </RevealSection>
    </section>
  );
}
