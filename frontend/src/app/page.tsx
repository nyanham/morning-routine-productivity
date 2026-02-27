import {
  Header,
  Footer,
  HeroSection,
  Features,
  CommunityPreview,
  HowItWorks,
  CTABanner,
} from '@/components/landing';

/**
 * Public landing page.
 *
 * Layout: Header → Hero → Features → Community Preview → How It Works → CTA → Footer
 *
 * Each section is a standalone component living in `@/components/landing`
 * so they can be tested and iterated on independently.
 */
export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <HeroSection />
        <Features />
        <CommunityPreview />
        <HowItWorks />
        <CTABanner />
      </main>

      <Footer />
    </div>
  );
}
