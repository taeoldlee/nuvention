import { useState } from 'react';

export default function Avatar({ src, name, size = 'md', borderClass = 'border-accent' }) {
  const [failed, setFailed] = useState(false);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-10 h-10',
    xl: 'w-12 h-12',
  };

  const initial = name?.charAt(0)?.toUpperCase();
  const showImage = src && !failed;

  return (
    <div className={`${sizes[size]} rounded-full overflow-hidden border-2 ${borderClass} flex-shrink-0`}>
      {showImage ? (
        <img
          src={src}
          alt={name || ''}
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : initial ? (
        <div className="w-full h-full bg-bgWarm flex items-center justify-center font-bold text-muted text-sm">
          {initial}
        </div>
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
          <svg className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
        </div>
      )}
    </div>
  );
}
