export default function PricingCard({ title, price, description, items, highlight = false }) {
  return (
    <div
      className={`card rounded-2xl p-6 h-full ${
        highlight
          ? 'border-accent/30 shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
          : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-dark">{title}</h3>
        {highlight && (
          <span className="rounded-full border border-accent/20 bg-accentLight px-3 py-1 text-xs text-accent">
            Most common
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold text-dark">{price}</p>
      <p className="mt-2 text-sm text-mid">{description}</p>
      <ul className="mt-6 space-y-3 text-sm text-mid">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-accent" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
