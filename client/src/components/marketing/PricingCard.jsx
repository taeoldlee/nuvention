export default function PricingCard({ title, price, description, items, highlight = false }) {
  return (
    <div
      className={`rounded-2xl p-6 ${
        highlight
          ? 'gradient-border glass-panel shadow-[0_20px_50px_-30px_rgba(0,0,0,0.9)]'
          : 'glass-panel border border-white/10'
      }`}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg text-white">{title}</h3>
        {highlight && (
          <span className="rounded-full border border-white/20 px-3 py-1 text-xs text-slate-300/80">
            Most common
          </span>
        )}
      </div>
      <p className="mt-4 text-3xl font-semibold text-white">{price}</p>
      <p className="mt-2 text-sm text-slate-300/80">{description}</p>
      <ul className="mt-6 space-y-3 text-sm text-slate-300/80">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-300" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
