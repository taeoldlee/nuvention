import Button from './Button';

function openDemoSwitcher() {
  const demoBtn = document.querySelector('[data-demo-trigger]');
  if (demoBtn) demoBtn.click();
}

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 sm:px-10 lg:px-16">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-accent to-accent/60" />
          <span className="font-display text-lg font-semibold text-dark">Locale</span>
        </div>
        <Button onClick={openDemoSwitcher}>Try the demo</Button>
      </nav>
    </header>
  );
}
