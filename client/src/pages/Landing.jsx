import {
  BadgeCheck,
  Camera,
  ClipboardCheck,
  Eye,
  FileText,
  Fingerprint,
  Heart,
  Lock,
  MapPin,
  MessageCircle,
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
    title: 'Post a brief',
    description:
      'Describe the content you need — style, deliverables, timeline, and budget. It takes about 2 minutes.',
  },
  {
    step: '02',
    title: 'Review applications',
    description:
      'Local creators apply with their portfolio and pitch. Our AI ranks them by fit so you pick the best match.',
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
    title: 'Creators come to you',
    description:
      'Post what you need, and local creators apply with their best work. No searching, no cold outreach.',
  },
  {
    icon: MapPin,
    title: 'Creators who know your neighborhood',
    description:
      'Our portal attracts local creators who already shoot in your area — so the content feels authentic.',
  },
  {
    icon: Sparkles,
    title: 'AI-ranked applications',
    description:
      'Our matching algorithm scores every application against your brand vibe, so the best fits rise to the top.',
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

const creatorFeatures = [
  {
    icon: Camera,
    title: 'Browse open briefs',
    description:
      'See exactly what local brands need — deliverables, budget, timeline, and creative direction — all upfront.',
  },
  {
    icon: Heart,
    title: 'Apply on your terms',
    description:
      'No accounts required. Apply with your portfolio and pitch. Only take on work that fits your style and schedule.',
  },
  {
    icon: MessageCircle,
    title: 'Clear terms, no surprises',
    description:
      'See deliverables, compensation, and timeline upfront. Every collaboration has transparent terms from day one.',
  },
];

const trustPoints = [
  {
    title: 'Ranked by fit, not follower count',
    description:
      'Our AI scores applications against your brand vibe, so the best creators rise to the top.',
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
    title: 'Escrow-protected payments',
    description:
      'Your payment is held in escrow until you approve the content. No risk, no surprises.',
    icon: Lock,
  },
];

const pricing = [
  {
    title: 'Per‑brief pricing',
    price: 'Flat fee per brief',
    description: 'Pay only when a creator delivers.',
    items: [
      'Post briefs to the creator portal',
      'AI-ranked applications',
      'In‑app review with revisions',
      'Escrow-protected payments',
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
    question: 'How do creators find my brief?',
    answer:
      'Your brief is posted on our public portal where local creators browse opportunities. They apply with their portfolio and a pitch explaining why they\'re a great fit.',
  },
  {
    question: 'How do I pick the right creator?',
    answer:
      'Our AI ranks every application against your brand vibe and brief requirements. You see match scores, portfolios, and pitches — then select the creator you like best.',
  },
  {
    question: 'What if I don\'t like the content?',
    answer:
      'You review everything before it\'s final. You get revision rounds included in your brief, and nothing goes anywhere until you approve. Payment is held in escrow until you\'re happy.',
  },
  {
    question: 'Do creators need an account?',
    answer:
      'No. Creators apply through our public portal without creating an account. Once selected, they get a unique link to manage their project, submit drafts, and communicate with you.',
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
              Post a brief, review applications from local creators, and get content that matches your vibe. No negotiations, no management.
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
              'Creators apply to you',
              'Full usage rights',
              'Review before posting',
              'Escrow-protected',
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
                Post a brief and local creators come to you. Our AI ranks every application so you pick the best match.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['AI-ranked applications', 'Escrow payments', 'Nothing posts without approval'].map((label) => (
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

        <section id="creators" className="mx-auto max-w-6xl px-6 pb-20 sm:px-10 lg:px-16">
          <FadeIn>
            <SectionHeader
              eyebrow="For creators"
              title="Stop proving yourself. Start getting booked."
              description="You're talented — you just need access. Locale connects you with local restaurants and cafés that match your style, so you spend time creating, not pitching."
            />
          </FadeIn>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {creatorFeatures.map((feature, index) => (
              <FadeIn key={feature.title} delay={index * 0.05}>
                <div className="card card-hover rounded-2xl p-6 h-full">
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-creatorLight">
                    <feature.icon aria-hidden="true" className="h-5 w-5 text-creatorAccent" />
                  </div>
                  <h3 className="font-display text-lg text-dark">{feature.title}</h3>
                  <p className="mt-2 text-sm text-mid">{feature.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {[
              'No account required',
              'Apply to any brief',
              'Transparent compensation',
              'Build your portfolio',
            ].map((item) => (
              <span
                key={item}
                className="rounded-full border border-creator/20 bg-creatorLight px-4 py-2 text-xs text-creatorAccent"
              >
                {item}
              </span>
            ))}
          </FadeIn>
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
                  AI match score based on brand vibe fit
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  Aesthetic markers aligned with your vibe
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  Portfolio samples and content style tags
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
                  Creator pitch and compensation ask
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
                Post a brief, pick from local creator applications, and get content you'll actually post.
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
            <a className="hover:text-dark transition-colors" href="#creators">For Creators</a>
            <a className="hover:text-dark transition-colors" href="#trust">Trust</a>
            <a className="hover:text-dark transition-colors" href="#pricing">Pricing</a>
          </div>
          <p>© 2026 Locale</p>
        </div>
      </footer>
    </div>
  );
}
