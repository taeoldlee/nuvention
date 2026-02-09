export default function StepCard({ step, title, description }) {
  return (
    <div className="glass-panel gradient-border card-hover flex flex-col gap-4 rounded-2xl p-6 h-full">
      <span className="text-xs uppercase tracking-[0.2em] text-slate-400/70">
        Step {step}
      </span>
      <h3 className="font-display text-xl text-white">{title}</h3>
      <p className="text-sm text-slate-300/80">{description}</p>
    </div>
  );
}
