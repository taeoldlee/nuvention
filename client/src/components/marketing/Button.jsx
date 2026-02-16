export default function Button({
  href,
  onClick,
  children,
  variant = 'primary',
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/80';

  const styles =
    variant === 'primary'
      ? 'bg-accent text-white shadow-sm hover:bg-accent/90 hover:-translate-y-0.5'
      : 'border-2 border-border text-mid bg-white hover:bg-bgWarm hover:-translate-y-0.5';

  if (href && !href.startsWith('#')) {
    return (
      <a href={href} className={`${base} ${styles} ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <button onClick={onClick || (href ? () => { document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' }); } : undefined)} className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
