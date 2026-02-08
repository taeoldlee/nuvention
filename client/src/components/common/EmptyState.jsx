export default function EmptyState({ icon, title, description, action, className = '' }) {
  return (
    <div className={`text-center py-12 px-6 ${className}`}>
      {icon && (
        <div className="w-16 h-16 rounded-2xl bg-bgWarm shadow-sm mx-auto mb-4 flex items-center justify-center text-muted">
          {icon}
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-dark mb-2">{title}</h3>
      {description && <p className="text-muted text-sm max-w-sm mx-auto mb-6">{description}</p>}
      {action}
    </div>
  );
}
