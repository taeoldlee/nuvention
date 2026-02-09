export function SkeletonLine({ className = '', width = 'w-full' }) {
  return <div className={`h-4 bg-border/50 rounded animate-pulse ${width} ${className}`} />;
}

export function SkeletonCircle({ size = 'w-10 h-10', className = '' }) {
  return <div className={`rounded-full bg-border/50 animate-pulse ${size} ${className}`} />;
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`card animate-pulse ${className}`}>
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-border/50" />
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-border/50 rounded w-3/4" />
          <div className="h-3 bg-border/50 rounded w-1/2" />
          <div className="h-3 bg-border/50 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3, className = '' }) {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonImageGrid({ count = 6, className = '' }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-square rounded-xl bg-border/50 animate-pulse" />
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-border/50" />
              <div className="flex-1 space-y-2">
                <div className="h-5 bg-border/50 rounded w-12" />
                <div className="h-3 bg-border/50 rounded w-20" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <SkeletonGrid count={3} />
    </div>
  );
}
