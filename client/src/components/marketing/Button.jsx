export default function Button({
  href,
  children,
  variant = 'primary',
  className = '',
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#7D8BFF]/80';

  const styles =
    variant === 'primary'
      ? 'bg-gradient-to-r from-[#5B6CFF] via-[#7D8BFF] to-[#4DD4A6] text-white shadow-[0_18px_50px_-25px_rgba(0,0,0,0.9)] hover:shadow-[0_22px_60px_-25px_rgba(0,0,0,0.95)] hover:-translate-y-0.5'
      : 'border border-white/20 text-slate-100/90 hover:text-white hover:border-white/40 hover:-translate-y-0.5';

  if (href) {
    return (
      <a href={href} className={`${base} ${styles} ${className}`}>
        {children}
      </a>
    );
  }

  return (
    <button className={`${base} ${styles} ${className}`}>
      {children}
    </button>
  );
}
