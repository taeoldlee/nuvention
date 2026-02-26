import { Link } from 'react-router-dom';
import {
  BarChart3,
  MapPin,
  Sparkles,
  Users,
} from 'lucide-react';

import FadeIn from '../components/marketing/FadeIn';
import Navbar from '../components/marketing/Navbar';
import SectionHeader from '../components/marketing/SectionHeader';
import FeatureCard from '../components/marketing/FeatureCard';
import StepCard from '../components/marketing/StepCard';
import Button from '../components/marketing/Button';

const steps = [
  {
    step: '01',
    title: 'Tell us your brand',
    description:
      'Set up your profile in minutes. We learn your vibe, your neighborhood, and what kind of content works for businesses like yours.',
  },
  {
    step: '02',
    title: 'See what content works',
    description:
      'Our AI analyzes what performs best for your type of business and gives you clear, actionable content recommendations.',
  },
  {
    step: '03',
    title: 'Get matched with creators',
    description:
      'Browse our curated database of local creators — filtered by style, location, and fit — and start a project in one click.',
  },
];

const features = [
  {
    icon: BarChart3,
    title: 'Know what content works',
    description:
      'Get AI-powered insights on what type of content performs best for your business — so you stop guessing and start posting with confidence.',
  },
  {
    icon: Users,
    title: 'Curated creator database',
    description:
      'Browse a database of vetted local creators matched to your brand. Filter by style, platform, and neighborhood — no cold outreach needed.',
  },
  {
    icon: MapPin,
    title: 'Hyperlocal matching',
    description:
      'Creators who already know your neighborhood and shoot in your area. The content feels authentic because it is.',
  },
  {
    icon: Sparkles,
    title: 'AI-powered recommendations',
    description:
      'Our matching algorithm scores creators against your brand vibe, so the best fits rise to the top.',
  },
];

export default function Landing() {
  const handleGetStarted = () => {
    const demoBtn = document.querySelector('[data-demo-trigger]');
    if (demoBtn) demoBtn.click();
  };

  return (
    <div className="min-h-screen bg-bgTan text-dark">
      <Navbar />

      <main id="main-content" className="relative">
        {/* Hero */}
        <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-20 text-center sm:px-10 sm:pt-28 lg:px-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(184,80,66,0.08),transparent_60%)]" />

          <FadeIn className="flex flex-col items-center gap-6">
            <span className="rounded-full border border-border bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted">
              For restaurants & cafes
            </span>
            <h1 className="max-w-3xl font-display text-4xl font-semibold text-dark sm:text-5xl lg:text-6xl">
              Know what content works. Find creators who can make it.
            </h1>
            <p className="max-w-2xl text-base text-mid sm:text-lg">
              Locale helps you understand which content drives results for your business — then connects you with local creators who can produce it.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button onClick={handleGetStarted}>Get started</Button>
              <Link
                to="/portal/briefs"
                className="inline-flex items-center justify-center rounded-full border border-border bg-white px-6 py-3 text-sm font-semibold text-dark shadow-sm transition-all duration-300 hover:bg-bgWarm hover:-translate-y-0.5"
              >
                Browse open briefs
              </Link>
            </div>
          </FadeIn>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto max-w-6xl px-6 pb-20 sm:px-10 lg:px-16">
          <FadeIn>
            <SectionHeader
              eyebrow="How it works"
              title="From setup to your first project in minutes."
            />
          </FadeIn>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, index) => (
              <FadeIn key={step.step} delay={index * 0.1}>
                <StepCard {...step} />
              </FadeIn>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 pb-20 sm:px-10 lg:px-16">
          <FadeIn>
            <SectionHeader
              eyebrow="Why Locale"
              title="Content strategy and creator sourcing — in one place."
            />
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {features.map((feature, index) => (
              <FadeIn key={feature.title} delay={index * 0.05}>
                <FeatureCard {...feature} />
              </FadeIn>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section id="cta" className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 lg:px-16">
          <FadeIn className="card flex flex-col items-center gap-6 rounded-3xl p-10 text-center">
            <h2 className="font-display text-3xl font-semibold text-dark">
              Ready to stop guessing what to post?
            </h2>
            <p className="max-w-lg text-sm text-mid">
              Set up your brand, get content insights, and connect with creators who match your vibe.
            </p>
            <Button onClick={handleGetStarted}>Get started</Button>
          </FadeIn>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-accent/60" />
            <span className="font-display text-dark">Locale</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a className="hover:text-dark transition-colors" href="#how-it-works">How it works</a>
            <a className="hover:text-dark transition-colors" href="#features">Features</a>
            <Link className="hover:text-dark transition-colors" to="/portal/briefs">Browse Briefs</Link>
          </div>
          <p>&copy; 2026 Locale</p>
        </div>
      </footer>
    </div>
  );
}
