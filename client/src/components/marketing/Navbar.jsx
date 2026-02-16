import { useState } from 'react';
import Button from './Button';

const links = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Trust', href: '#trust' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

function openDemoSwitcher() {
  const demoBtn = document.querySelector('[data-demo-trigger]');
  if (demoBtn) demoBtn.click();
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-sm">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-dark">
        Skip to content
      </a>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-accent/60" />
          <span className="font-display text-lg font-semibold text-dark">Locale</span>
        </div>
        <div className="hidden items-center gap-6 text-sm text-muted md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-dark transition-colors">
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Hamburger button — visible below md */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-lg text-muted hover:text-dark transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>

          <div className="hidden md:flex items-center gap-3">
            <Button onClick={openDemoSwitcher} variant="secondary">
              Request demo
            </Button>
            <Button onClick={openDemoSwitcher}>Create a brief</Button>
          </div>
        </div>
      </nav>

      {/* Mobile menu panel */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-white/98 backdrop-blur-sm">
          <div className="px-6 py-4 space-y-1">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-base text-mid hover:text-dark transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 flex flex-col gap-3">
              <Button onClick={openDemoSwitcher} variant="secondary">Request demo</Button>
              <Button onClick={openDemoSwitcher}>Create a brief</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
