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
    title: 'Brand alignment intake',
    description:
      'Capture vibe sliders, values, guest‑experience keywords, and optional visual references so creators understand your brand before anything else.',
  },
  {
    step: '02',
    title: 'Evidence‑based shortlist',
    description:
      'Review a maximum of three creators with content previews first and clear evidence: venue similarity, aesthetic markers, and community signals.',
  },
  {
    step: '03',
    title: 'Commission with clarity',
    description:
      'Launch a standardized brief, review drafts in‑platform, allow one minor revision, and receive usage rights documentation with escrow protection.',
  },
];

const features = [
  {
    icon: Fingerprint,
    title: 'Anonymous creator evaluation',
    description:
      'Assess content quality before identity is revealed. Bias stays low and brand fit stays high.',
  },
  {
    icon: MapPin,
    title: 'Hyperlocal context',
    description:
      'Creators are matched based on real neighborhood proximity and venue similarity.',
  },
  {
    icon: Sparkles,
    title: 'Clear creative direction',
    description:
      'Brief templates make it easy to specify goals, subject, and tone without writing from scratch.',
  },
  {
    icon: ClipboardCheck,
    title: 'In‑platform review',
    description:
      'Approve drafts, request one revision, and track delivery without switching tools.',
  },
  {
    icon: FileText,
    title: 'Usage rights built‑in',
    description:
      'Every project includes a clean usage rights document you can file with confidence.',
  },
  {
    icon: Wallet,
    title: 'Payment protection',
    description:
      'Escrow‑style handling protects both sides and keeps projects on schedule.',
  },
];

const trustPoints = [
  {
    title: 'Brand safety by design',
    description:
      'Creators are vetted and matched through evidence signals, not follower counts or popularity.',
    icon: ShieldCheck,
  },
  {
    title: 'Review before posting',
    description:
      'Nothing goes live without your approval, with one included round of minor revisions.',
    icon: Eye,
  },
  {
    title: 'Usage rights documented',
    description:
      'Clear documentation ensures everyone knows exactly how content can be used.',
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
    title: 'Per‑project commission',
    price: 'Flat commission',
    description: 'Pay only when you commission a creator.',
    items: [
      'Evidence‑based matching (max 3 creators)',
      'Brief template + usage rights documentation',
      'In‑platform review with one revision',
      'Payment protection and escrow handling',
    ],
    highlight: true,
  },
  {
    title: 'Multi‑location teams',
    price: 'Transparent team plan',
    description: 'Ideal for small brands managing multiple locations.',
    items: [
      'Centralized brand standards',
      'Shared creator pool with locality controls',
      'Consolidated billing and reporting',
    ],
  },
];

const faqs = [
  {
    question: 'How do you make sure creators fit our brand?',
    answer:
      'We capture your vibe, values, guest‑experience keywords, and references first, then match on evidence signals like venue similarity and aesthetic markers.',
  },
  {
    question: 'Will we see creator profiles upfront?',
    answer:
      'No. You evaluate content first. Creator identity is revealed only after you select a match.',
  },
  {
    question: 'What protects us from posting risk?',
    answer:
      'You review drafts in‑platform, request one minor revision, and approve before anything goes live. Usage rights are documented.',
  },
  {
    question: 'Is this a marketplace or agency?',
    answer:
      'Neither. Locale is an opinionated commissioning product focused on brand safety, not bidding or creator discovery.',
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0B0D12] text-white">
      <Navbar />

      <main id="main-content" className="relative">
        <section className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-6 pb-20 pt-20 text-center sm:px-10 sm:pt-28 lg:px-16">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(93,115,255,0.25),transparent_60%)]" />
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,rgba(77,212,166,0.18),transparent_45%)]" />

          <FadeIn className="flex flex-col items-center gap-6">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-300/80">
              Brand‑safe commissioning
            </span>
            <h1 className="max-w-3xl font-display text-4xl font-semibold text-white sm:text-5xl lg:text-6xl">
              Commission local UGC with confidence.
            </h1>
            <p className="max-w-2xl text-base text-slate-300/80 sm:text-lg">
              Locale is an opinionated, hyperlocal UGC commissioning platform for restaurants and cafés. It helps you approve content fast because the match is brand‑safe and explainable.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Button href="#cta">Create a brief</Button>
              <Button href="#cta" variant="secondary">
                Request demo
              </Button>
            </div>
          </FadeIn>

          <FadeIn className="flex flex-wrap items-center justify-center gap-3">
            {[
              'Brand‑safe process',
              'Evidence‑based matching',
              'Usage rights included',
              'Escrow protection',
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300/80"
              >
                {item}
              </span>
            ))}
          </FadeIn>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16 sm:px-10 lg:px-16">
          <FadeIn className="glass-panel gradient-border flex flex-col items-center justify-between gap-6 rounded-3xl p-6 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">Trust strip</p>
              <p className="mt-3 text-lg text-white">
                Built for operators who need confidence, not just speed.
              </p>
              <p className="mt-2 text-sm text-slate-300/70">
                Locale prioritizes brand safety with evidence‑based matching and controlled identity disclosure.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['No follower bias', 'Max 3 options', 'Review before posting'].map((label) => (
                <span key={label} className="rounded-full border border-white/10 px-4 py-2 text-xs text-slate-300/80">
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
              title="Three steps from brand alignment to approved content."
              description="The flow is intentionally small so decision‑making stays fast and brand‑safe."
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
              title="Built for trust, clarity, and calm approvals."
              description="No discovery feeds, no bidding. Just a clean commissioning workflow designed for local operators."
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
                title="Brand safety is the product, not an add‑on."
                description="Every step prioritizes clear expectations, controlled exposure, and documented rights."
              />
              <div className="mt-8 space-y-5">
                {trustPoints.map((item) => (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                      <item.icon className="h-5 w-5 text-emerald-300" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{item.title}</h3>
                      <p className="text-sm text-slate-300/80">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeIn>

            <FadeIn className="glass-panel gradient-border rounded-3xl p-8">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/10 flex items-center justify-center">
                  <BadgeCheck className="h-5 w-5 text-[#7D8BFF]" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">Match evidence</p>
                  <p className="text-base text-white">What you’ll see on every shortlist card</p>
                </div>
              </div>
              <ul className="mt-6 space-y-4 text-sm text-slate-300/80">
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#7D8BFF]" />
                  Venue similarity and neighborhood overlap
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#7D8BFF]" />
                  Aesthetic markers aligned with your vibe
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#7D8BFF]" />
                  Community signals and creator tier context
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#7D8BFF]" />
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
              title="Simple, transparent pricing for local teams."
              description="Pay per project with a clear commission model, or consolidate multiple locations."
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
              title="Short answers for busy operators."
              description="If you need more detail, we’ll walk you through a live flow in minutes."
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
          <FadeIn className="glass-panel gradient-border flex flex-col items-center justify-between gap-8 rounded-3xl p-10 text-center sm:flex-row sm:text-left">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-300/70">Ready when you are</p>
              <h2 className="mt-4 font-display text-3xl font-semibold text-white">
                Commission your next UGC project with confidence.
              </h2>
              <p className="mt-3 text-sm text-slate-300/80">
                We’ll guide your team through brand alignment, evidence‑based matching, and an in‑platform review flow.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button href="#">Create a brief</Button>
              <Button href="#" variant="secondary">Request demo</Button>
            </div>
          </FadeIn>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 sm:px-10 lg:px-16">
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 text-sm text-slate-300/60 sm:flex-row">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#7D8BFF] to-[#4DD4A6]" />
            <span className="font-display text-white">Locale</span>
          </div>
          <div className="flex flex-wrap items-center gap-5">
            <a className="hover:text-white transition-colors" href="#how-it-works">How it works</a>
            <a className="hover:text-white transition-colors" href="#features">Features</a>
            <a className="hover:text-white transition-colors" href="#trust">Trust</a>
            <a className="hover:text-white transition-colors" href="#pricing">Pricing</a>
          </div>
          <p>© 2026 Locale</p>
        </div>
      </footer>
    </div>
  );
}
