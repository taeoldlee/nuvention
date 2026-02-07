export default function LoadingSpinner({ message, creator = false, className = '' }) {
  const color = creator ? 'border-creatorAccent' : 'border-accent';

  return (
    <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
      <div
        className={`w-10 h-10 border-3 ${color} border-t-transparent rounded-full animate-spin mb-4`}
        style={{ borderWidth: '3px' }}
      />
      {message && <p className="text-muted text-sm font-medium">{message}</p>}
    </div>
  );
}
