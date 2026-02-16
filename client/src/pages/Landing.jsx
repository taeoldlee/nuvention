import {
  BadgeCheck,
  ClipboardCheck,
  Eye,
  FileText,
  Fingerprint,
  Lock,
  MapPin,
  ShieldCheck,
  Sparkles,
  Wallet,
} from 'lucide-react';

import FadeIn from '../components/marketing/FadeIn';
import Navbar from '../components/marketing/Navbar';
import SectionHeader from '../components/marketing/SectionHeader';
import FeatureCard from '../components/marketing/FeatureCard';
import StepCard from '../components/marketing/StepCard';
import PricingCard from '../components/marketing/PricingCard';
import FAQItem from '../components/marketing/FAQItem';
import Button from '../components/marketing/Button';

const steps = [
  {
    step: '01',
    title: 'Set your vibe',
    description:
      'Answer a few quick questions about your place. We use this to find creators who already shoot your style.',
  },
  {
    step: '02',
    title: 'Pick from 3 options',
    description:
      'See real content samples from creators matched to your vibe. No follower counts, no profiles — just the work.',
  },
  {
    step: '03',
    title: 'Approve and post',
    description:
      'Review the draft, request one tweak if needed, and download your content with full usage rights. That\'s it.',
  },
];

const features = [
  {
    icon: Fingerprint,
    title: 'Content first, profile later',
    description:
      'See the work before you see the creator. You\'re picking content, not followers.',
  },
  {
    icon: MapPin,
    title: 'Creators who know your neighborhood',
    description:
      'We match based on where they shoot — so the content already looks like it belongs.',
  },
  {
    icon: Sparkles,
    title: 'No writing briefs from scratch',
    description:
      'Pick from templates. Tell us what you need photos of. We handle the rest.',
  },
  {
    icon: ClipboardCheck,
    title: 'Review and approve in one place',
    description:
      'See drafts, request one tweak, download finals. No email chains.',
  },
  {
    icon: FileText,
    title: 'Full usage rights, documented',
    description:
      'Post anywhere, run ads, repurpose freely. The paperwork is already done.',
  },
  {
    icon: Wallet,
    title: 'Pay when you approve',
    description:
      'Your payment is held until you\'re happy with the content. No risk.',
  },
];

const trustPoints = [
  {
    title: 'Matched by style, not follower count',
    description:
      'We look at what creators shoot, not how many people follow them.',
    icon: ShieldCheck,
  },
  {
    title: 'Approve before anything goes live',
    description:
      'Review drafts, request one tweak, then download. You\'re always in control.',
    icon: Eye,
  },
  {
    title: 'Full rights, no questions',
    description:
      'Post it, boost it, reuse it. The paperwork is handled.',
    icon: FileText,
  },
  {
    title: 'Private by default',
    description:
      'Creator identity stays hidden until you select a match, minimizing risk and bias.',
    icon: Lock,
  },
];

const pricing = [
  {
    title: 'Per‑project pricing',
    price: 'Flat fee per project',
    description: 'Pay only when you order content.',
    items: [
      'Matched creators (max 3 options)',
      'Brief template + full usage rights',
      'In‑app review with one revision',
      'Payment held until you approve',
    ],
    highlight: true,
  },
  {
    title: 'Multi‑location teams',
    price: 'One account, multiple locations',
    description: 'Centralized billing, shared creator pool.',
    items: [
      'Centralized brand standards',
      'Shared creator pool with locality controls',
      'Consolidated billing and reporting',
    ],
  },
];

const faqs = [
  {
    question: 'How do you match creators to my place?',
    answer:
      'You tell us your vibe — we find creators who already shoot that style in your area. You see their work before you see their profile.',
  },
  {
    question: 'Do I see who the creator is before I choose?',
    answer:
      'No — and that\'s intentional. You pick based on the content, not the follower count. You see who they are after you choose.',
  },
  {
    question: 'What if I don\'t like the content?',
    answer:
      'You review everything before it\'s final. You get one round of revisions, and nothing goes anywhere until you approve. If it\'s still not right, you don\'t pay.',
  },
  {
    question: 'Is this a marketplace or an agency?',
    answer:
      'Neither. Think of it like ordering photography — you tell us what you need, we bring you options, you pick one.',
  },
];

export default function Landing() {
  const handleCreateBrief = () => {
    // Open the demo switcher so user picks an operator account
    const demoBtn = document.querySelector('[data-demo-trigger]');
    if (demoBtn) demoBtn.click();
  };

  return (
    <div className="min-h-screen bg-bgTan text-dark">
      <Navbar />

      <main id="main-content" className="relative">
        <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-20 text-center sm:px-10 sm:pt-28 lg:px-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(184,80,66,0.08),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(184,80,66,0.05),transparent_45%)]" />

          <FadeIn className="flex flex-col items-center gap-6">
            <span className="rounded-full border border-border bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted">
              For restaurants & cafés
            </span>
            <h1 className="max-w-3xl font-display text-4xl font-semibold text-dark sm:text-5xl lg:text-6xl">
              Get content that looks like your place.
            </h1>
            <p className="max-w-2xl text-base text-mid sm:text-lg">
              We match you with local creators who already shoot your vibe. Pick from 3 options, approve what fits, and post. No negotiations, no management.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button onClick={handleCreateBrief}>Get started</Button>
              <Button onClick={handleCreateBrief} variant="secondary">
                Request demo
              </Button>
            </div>
          </FadeIn>

          <FadeIn className="flex flex-wrap items-center justify-center gap-3">
            {[
              '3 options, not 300',
              'Full usage rights',
              'Review before posting',
              'Payment protected',
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-border bg-white px-4 py-2 text-xs text-muted"
              >
                {item}
              </span>
            ))}
          </FadeIn>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-10 lg:px-16">
          <FadeIn className="card flex flex-col items-center justify-between gap-6 rounded-3xl p-6 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Trust strip</p>
              <p className="mt-3 text-lg text-dark">
                Built for busy owners who don't have time to manage creators.
              </p>
              <p className="mt-2 text-sm text-muted">
                Every creator is matched to your vibe before you see their profile — so you're choosing content, not followers.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['Style over followers', 'Just 3 options', 'Nothing posts without approval'].map((label) => (
                <span key={label} className="rounded-full border border-border bg-white px-4 py-2 text-xs text-muted">
                  {label}
                </span>
              ))}
            </div>
          </FadeIn>
        </section>

        <section id="how-it-works" className="mx-auto max-w-6xl px-6 pb-20 sm:px-10 lg:px-16">
          <FadeIn>
            <SectionHeader
              eyebrow="How it works"
              title="Three steps to content you'll actually post."
              description="Tell us your vibe once, pick your favorite option, and you're done."
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

        <section id="features" className="mx-auto max-w-6xl px-6 pb-20 sm:px-10 lg:px-16">
          <FadeIn>
            <SectionHeader
              eyebrow="Core features"
              title="Everything that makes creator content stressful — gone."
              description="No browsing hundreds of profiles. No back‑and‑forth negotiations. No surprises."
            />
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <FadeIn key={feature.title} delay={index * 0.05}>
                <FeatureCard {...feature} />
              </FadeIn>
            ))}
          </div>
        </section>

        <section id="trust" className="mx-auto max-w-6xl px-6 pb-20 sm:px-10 lg:px-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <FadeIn>
              <SectionHeader
                eyebrow="Trust & safety"
                title="You approve everything before it goes anywhere."
                description="Clear terms upfront. One round of revisions. Full usage rights. Nothing surprises you."
              />
              <div className="mt-8 space-y-5">
                {trustPoints.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accentLight">
                      <item.icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-dark">{item.title}</h3>
                      <p className="text-sm text-mid">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn className="card rounded-3xl p-8">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-accentLight flex items-center justify-center">
                  <BadgeCheck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted">Match evidence</p>
                  <p className="text-base text-dark">What you'll see on every shortlist card</p>
                </div>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-mid">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  Venue similarity and neighborhood overlap
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  Aesthetic markers aligned with your vibe
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  Community signals and creator tier context
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  Past outcomes and turnaround history
                </li>
              </ul>
            </FadeIn>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-6 pb-20 sm:px-10 lg:px-16">
          <FadeIn>
            <SectionHeader
              eyebrow="Pricing"
              title="Pay per project. No subscriptions, no surprises."
              description="Flat fee per project, or consolidate multiple locations under one account."
              align="center"
            />
          </FadeIn>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {pricing.map((plan, index) => (
              <FadeIn key={plan.title} delay={index * 0.1}>
                <PricingCard {...plan} />
              </FadeIn>
            ))}
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-5xl px-6 pb-24 sm:px-10 lg:px-16">
          <FadeIn>
            <SectionHeader
              eyebrow="FAQ"
              title="Common questions"
              description="If you need more detail, we'll walk you through a live flow in minutes."
              align="center"
            />
          </FadeIn>
          <div className="mt-10 grid gap-4">
            {faqs.map((faq) => (
              <FAQItem key={faq.question} {...faq} />
            ))}
          </div>
        </section>

        <section id="cta" className="mx-auto max-w-6xl px-6 pb-24 sm:px-10 lg:px-16">
          <FadeIn className="card flex flex-col items-center justify-between gap-8 rounded-3xl p-10 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Ready when you are</p>
              <h2 className="mt-4 font-display text-3xl font-semibold text-dark">
                Ready to get content that actually looks like your place?
              </h2>
              <p className="mt-3 text-sm text-mid">
                Set your vibe once, pick from 3 options, and post. We'll walk you through it.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button onClick={handleCreateBrief}>Get started</Button>
              <Button onClick={handleCreateBrief} variant="secondary">Request demo</Button>
            </div>
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
            <a className="hover:text-dark transition-colors" href="#trust">Trust</a>
            <a className="hover:text-dark transition-colors" href="#pricing">Pricing</a>
          </div>
          <p>© 2026 Locale</p>
        </div>
      </footer>
    </div>
  );
}
