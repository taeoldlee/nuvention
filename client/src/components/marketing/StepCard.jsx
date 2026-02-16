export default function StepCard({ step, title, description }) {
  return (
    <div className="card card-hover flex flex-col gap-4 rounded-2xl p-6 h-full">
      <span className="text-xs uppercase tracking-[0.2em] text-muted">
        Step {step}
      </span>
      <h3 className="font-display text-xl text-dark">{title}</h3>
      <p className="text-sm text-mid">{description}</p>
    </div>
  );
}
