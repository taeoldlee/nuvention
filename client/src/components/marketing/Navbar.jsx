import Button from './Button';

const links = [
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Features', href: '#features' },
  { label: 'Trust', href: '#trust' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#0B0D12]/70 backdrop-blur-xl">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-dark">
        Skip to content
      </a>
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-[#7D8BFF] to-[#4DD4A6]" />
          <span className="font-display text-lg font-semibold text-white">Locale</span>
        </div>
        <div className="hidden items-center gap-6 text-sm text-slate-300/80 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="hover:text-white transition-colors">
              {link.label}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Button href="#cta" variant="secondary" className="hidden sm:inline-flex">
            Request demo
          </Button>
          <Button href="#cta">Create a brief</Button>
        </div>
      </nav>
    </header>
  );
}
