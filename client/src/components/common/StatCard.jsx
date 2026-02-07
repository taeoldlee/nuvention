export default function StatCard({ label, value, icon, creator = false, className = '' }) {
  const bg = creator ? 'bg-creatorLight' : 'bg-accentLight';
  const iconColor = creator ? 'text-creator' : 'text-accent';

  return (
    <div className={`card ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted mb-1">{label}</p>
          <p className="text-2xl font-bold text-dark">{value}</p>
        </div>
        {icon && (
          <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${iconColor}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
