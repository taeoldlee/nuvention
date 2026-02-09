export default function Btn({
  children,
  variant = 'primary',
  creator = false,
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) {
  const base =
    'inline-flex items-center justify-center font-body font-semibold transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:ring-offset-2';

  const sizes = {
    sm: 'px-4 py-2.5 text-sm min-h-[44px]',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variants = {
    primary: creator
      ? 'bg-creatorAccent hover:bg-creatorAccent/90 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5'
      : 'bg-accent hover:bg-accent/90 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5',
    secondary:
      'border-2 border-border bg-white hover:bg-bgWarm text-mid hover:shadow-sm',
    ghost: 'text-muted hover:text-dark hover:bg-bgWarm',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
