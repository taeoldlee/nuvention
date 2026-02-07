export default function MatchScoreBadge({ score, size = 'md', className = '' }) {
  const getColor = (s) => {
    if (s >= 90) return { ring: 'ring-green/20', text: 'text-green', bg: 'bg-greenBg' };
    if (s >= 80) return { ring: 'ring-blue-200', text: 'text-blue-700', bg: 'bg-blue-50' };
    if (s >= 70) return { ring: 'ring-yellow-200', text: 'text-yellowText', bg: 'bg-yellowBg' };
    return { ring: 'ring-gray-200', text: 'text-muted', bg: 'bg-gray-50' };
  };

  const color = getColor(score);
  const sizes = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-14 h-14 text-sm',
    lg: 'w-18 h-18 text-base',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full ${color.bg} ${color.text} ring-2 ${color.ring} flex flex-col items-center justify-center font-bold ${className}`}
    >
      <span>{score}%</span>
    </div>
  );
}
