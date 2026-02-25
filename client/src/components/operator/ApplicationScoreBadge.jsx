export default function ApplicationScoreBadge({ score, size = 'md' }) {
  if (score == null) return null;

  const pct = Math.round(score);

  let bg = '#9ca3af';
  if (pct > 75) bg = '#4a7c59';
  else if (pct >= 50) bg = '#c4923a';
  else bg = '#b85c38';

  const sizeClass = size === 'sm'
    ? 'w-8 h-8 text-[10px]'
    : 'w-10 h-10 text-xs';

  return (
    <div
      style={{ backgroundColor: bg }}
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold font-body flex-shrink-0`}
      title={`AI Match: ${pct}%`}
    >
      {pct}
    </div>
  );
}
