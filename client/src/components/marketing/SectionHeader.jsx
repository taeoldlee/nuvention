export default function SectionHeader({
  eyebrow,
  title,
  description,
  align = 'left',
}) {
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`flex flex-col gap-4 ${alignClass}`}>
      <span className="text-xs uppercase tracking-[0.3em] text-muted">
        {eyebrow}
      </span>
      <h2 className="font-display text-3xl font-semibold text-dark sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="max-w-2xl text-base text-mid sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
