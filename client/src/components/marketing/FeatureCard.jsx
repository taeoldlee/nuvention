export default function FeatureCard({ icon: Icon, title, description }) {
  return (
    <div className="card card-hover rounded-2xl p-6 h-full">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-accentLight">
        <Icon aria-hidden="true" className="h-5 w-5 text-accent" />
      </div>
      <h3 className="font-display text-lg text-dark">{title}</h3>
      <p className="mt-2 text-sm text-mid">{description}</p>
    </div>
  );
}
