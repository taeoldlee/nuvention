export default function Chip({
  label,
  selected = false,
  creator = false,
  onClick,
  disabled = false,
  className = '',
}) {
  const base =
    'inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border cursor-pointer transition-all duration-200 select-none';

  const selectedClass = creator
    ? 'border-creator bg-creatorLight text-creator'
    : 'border-accent bg-accentLight text-accent';

  const unselectedClass = creator
    ? 'border-border bg-white text-mid hover:border-creator/50'
    : 'border-border bg-white text-mid hover:border-accent/50';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`${base} ${selected ? selectedClass : unselectedClass} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
    >
      {selected && (
        <svg
          className="w-3.5 h-3.5 mr-1.5 -ml-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      )}
      {label}
    </button>
  );
}
