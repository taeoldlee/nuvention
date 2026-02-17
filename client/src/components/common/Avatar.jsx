import { useState } from 'react';

export default function Avatar({ src, name, size = 'md', borderClass = 'border-accent' }) {
  const [failed, setFailed] = useState(false);

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-10 h-10 text-sm',
    xl: 'w-12 h-12 text-base',
  };

  const initial = name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden border-2 ${borderClass} flex-shrink-0`}>
      {src && !failed ? (
        <img
          src={src}
          alt={name || ''}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="w-full h-full bg-bgWarm flex items-center justify-center font-bold text-muted">
          {initial}
        </div>
      )}
    </div>
  );
}
