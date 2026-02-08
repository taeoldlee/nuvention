export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="glass-panel gradient-border card-hover rounded-2xl p-6">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
        <Icon aria-hidden="true" className="h-5 w-5 text-emerald-300" />
      </div>
      <h3 className="font-display text-lg text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-300/80">{description}</p>
    </div>
  );
}
