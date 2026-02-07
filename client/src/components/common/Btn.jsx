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
    'inline-flex items-center justify-center font-body font-semibold transition-all duration-200 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variants = {
    primary: creator
      ? 'bg-creatorAccent hover:bg-creatorAccent/90 text-white shadow-sm'
      : 'bg-accent hover:bg-accent/90 text-white shadow-sm',
    secondary:
      'border-2 border-border bg-white hover:bg-bgWarm text-mid',
    ghost: 'text-muted hover:text-dark hover:bg-bgWarm',
    danger: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
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
