import { useState, useEffect } from 'react';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'highMatch', label: 'High Match (>75)' },
  { key: 'nano', label: 'Nano / Micro' },
  { key: 'pending', label: 'Pending Only' },
];

const SORT_OPTIONS = [
  { value: 'bestMatch', label: 'Best Match' },
  { value: 'followers', label: 'Followers ↓' },
  { value: 'engagement', label: 'Engagement ↓' },
  { value: 'lowestCost', label: 'Lowest Cost' },
];

function getCreatorTier(followerCount) {
  if (!followerCount) return 'NANO';
  if (followerCount < 5000) return 'NANO';
  if (followerCount < 25000) return 'MICRO';
  if (followerCount < 100000) return 'MID';
  return 'MACRO';
}

export default function ApplicationFilters({ applications, onChange }) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [sortBy, setSortBy] = useState('bestMatch');

  useEffect(() => {
    let filtered = [...applications];

    if (activeFilter === 'highMatch') {
      filtered = filtered.filter((a) => (a.aiMatchScore || 0) > 75);
    } else if (activeFilter === 'nano') {
      filtered = filtered.filter((a) => {
        const tier = getCreatorTier(a.followerCount);
        return tier === 'NANO' || tier === 'MICRO';
      });
    } else if (activeFilter === 'pending') {
      filtered = filtered.filter((a) => a.status === 'PENDING');
    }

    if (sortBy === 'bestMatch') {
      filtered.sort((a, b) => (b.aiMatchScore || 0) - (a.aiMatchScore || 0));
    } else if (sortBy === 'followers') {
      filtered.sort((a, b) => (b.followerCount || 0) - (a.followerCount || 0));
    } else if (sortBy === 'engagement') {
      filtered.sort((a, b) => (b.engagementRate || 0) - (a.engagementRate || 0));
    } else if (sortBy === 'lowestCost') {
      filtered.sort((a, b) => {
        const aFree = !a.compensationAsk || a.compensationAsk.toLowerCase().includes('accept');
        const bFree = !b.compensationAsk || b.compensationAsk.toLowerCase().includes('accept');
        if (aFree && !bFree) return -1;
        if (!aFree && bFree) return 1;
        return 0;
      });
    }

    onChange(filtered);
  }, [activeFilter, sortBy, applications, onChange]);

  if (applications.length === 0) return null;

  const avgScore = applications.length > 0
    ? Math.round(applications.reduce((s, a) => s + (a.aiMatchScore || 0), 0) / applications.length)
    : 0;
  const bestScore = applications.length > 0
    ? Math.round(Math.max(...applications.map((a) => a.aiMatchScore || 0)))
    : 0;

  return (
    <div className="mb-4 space-y-3">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-3 text-sm font-body text-muted">
        <span className="font-semibold text-dark">{applications.length} application{applications.length !== 1 ? 's' : ''}</span>
        {avgScore > 0 && (
          <>
            <span className="text-border">·</span>
            <span>Avg match: <span className="font-semibold text-dark">{avgScore}%</span></span>
            <span className="text-border">·</span>
            <span>Best match: <span className="font-semibold text-dark">{bestScore}%</span></span>
          </>
        )}
      </div>

      {/* Filter pills + Sort */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5 flex-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold font-body transition-all ${
                activeFilter === f.key
                  ? 'bg-accent text-white'
                  : 'bg-bgWarm text-mid border border-border hover:border-accent/40 hover:text-dark'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted font-body hidden sm:inline">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-border bg-white text-xs font-body text-dark focus:outline-none focus:ring-1 focus:ring-accent/30 cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

export { getCreatorTier };
