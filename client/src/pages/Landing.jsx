import { MapPin, Sparkles, ClipboardList } from 'lucide-react';
import Navbar from '../components/marketing/Navbar';
import Button from '../components/marketing/Button';

const benefits = [
  {
    icon: ClipboardList,
    title: 'Post a brief, get applicants',
    description:
      'Describe the content you need. Local creators apply to you — no cold outreach.',
  },
  {
    icon: MapPin,
    title: 'Hyperlocal creators',
    description:
      'Every creator already knows your neighborhood. The content feels authentic because it is.',
  },
  {
    icon: Sparkles,
    title: 'AI-ranked matches',
    description:
      'Our AI scores every applicant against your brand so the best fits rise to the top.',
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

      <main className="relative">
        {/* Hero */}
        <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pt-20 pb-16 text-center sm:pt-28">
          <span className="rounded-full border border-border bg-white px-4 py-2 text-xs uppercase tracking-[0.3em] text-muted">
            For restaurants, cafes & bakeries
          </span>
          <h1 className="font-display text-4xl font-semibold text-dark sm:text-5xl lg:text-6xl">
            Great content for your restaurant — without the guesswork
          </h1>
          <p className="max-w-xl text-base text-mid sm:text-lg">
            Locale helps local F&B brands source UGC from nearby creators. Post a brief, review applicants, and get content that actually fits your brand.
          </p>
          <Button onClick={handleGetStarted}>Try the demo</Button>
        </section>

        {/* Benefits */}
        <section className="mx-auto max-w-4xl px-6 pb-20 sm:px-10">
          <div className="grid gap-6 sm:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="card rounded-2xl p-6 text-center">
                <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accentLight">
                  <b.icon aria-hidden="true" className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-lg text-dark">{b.title}</h3>
                <p className="mt-2 text-sm text-mid">{b.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-3xl px-6 pb-24 sm:px-10">
          <div className="card flex flex-col items-center gap-5 rounded-3xl p-10 text-center">
            <h2 className="font-display text-2xl font-semibold text-dark sm:text-3xl">
              See how it works
            </h2>
            <p className="max-w-md text-sm text-mid">
              Set up a brand profile, browse creators, and launch a content project — all in the demo.
            </p>
            <Button onClick={handleGetStarted}>Get started</Button>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 sm:px-10 lg:px-16">
        <div className="flex items-center justify-between border-t border-border pt-8 text-sm text-muted">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-accent to-accent/60" />
            <span className="font-display text-dark">Locale</span>
          </div>
          <p>&copy; 2026 Locale</p>
        </div>
      </footer>
    </div>
  );
}
