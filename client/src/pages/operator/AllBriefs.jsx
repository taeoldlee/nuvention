import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getBriefs } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Btn from '../../components/common/Btn';
import FadeIn from '../../components/marketing/FadeIn';
import { SkeletonGrid } from '../../components/common/Skeleton';

// ─── Content-type label map ──────────────────────────────────────────────────
const CONTENT_TYPE_LABELS = {
  REEL: 'Reel',
  CAROUSEL: 'Carousel',
  STORY: 'Story',
  TIKTOK: 'TikTok',
  PHOTO_SET: 'Photo Set',
  BLOG_POST: 'Blog Post',
};

function formatContentTypes(types) {
  if (!types) return '';
  const arr = Array.isArray(types) ? types : [types];
  return arr.map((t) => CONTENT_TYPE_LABELS[t] || t).join(', ');
}

// ─── Campaign-goal label map ─────────────────────────────────────────────────
const GOAL_LABELS = {
  EVENT_PROMO: 'Event Promo',
  MENU_LAUNCH: 'Menu Launch',
  SEASONAL_SPECIAL: 'Seasonal Special',
  GENERAL_CONTENT: 'General Content',
  GRAND_OPENING: 'Grand Opening',
  SLOW_PERIOD_FILL: 'Slow Period Fill',
};

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'OPEN', label: 'Open' },
  { value: 'CLOSED', label: 'Closed' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'applications-desc', label: 'Most Applications' },
  { value: 'applications-asc', label: 'Fewest Applications' },
  { value: 'status', label: 'Status' },
];

const STATUS_ORDER = { OPEN: 0, DRAFT: 1, CLOSED: 2 };

export default function AllBriefs() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [briefs, setBriefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter/sort state
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date-desc');

  useEffect(() => {
    if (!profile) return;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await getBriefs();
        setBriefs(res.data.briefs || []);
      } catch (err) {
        console.error('AllBriefs load error:', err);
        setError('Could not load briefs. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id, profile]);

  // ── Filtered + sorted data ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...briefs];

    // Status filter
    if (statusFilter) {
      result = result.filter((b) => b.status === statusFilter);
    }

    // Search by title
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((b) => b.title?.toLowerCase().includes(q));
    }

    // Sort
    const [sortKey, sortDir] = sort.split('-');
    result.sort((a, b) => {
      if (sortKey === 'date') {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return sortDir === 'desc' ? db - da : da - db;
      }
      if (sortKey === 'applications') {
        const ca = a._count?.applications ?? 0;
        const cb = b._count?.applications ?? 0;
        return sortDir === 'desc' ? cb - ca : ca - cb;
      }
      if (sortKey === 'status') {
        return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      }
      return 0;
    });

    return result;
  }, [briefs, statusFilter, search, sort]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="h-4 w-20 bg-border/50 rounded animate-pulse mb-2" />
            <div className="h-8 w-48 bg-border/50 rounded animate-pulse" />
          </div>
          <SkeletonGrid count={4} />
        </div>
      </div>
    );
  }

  // ── Error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 font-body mb-4">{error}</p>
            <Btn onClick={() => window.location.reload()}>Retry</Btn>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* ── Header ────────────────────────────────────────────────────── */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
            <div>
              <Link
                to="/operator/dashboard"
                className="text-sm text-muted hover:text-dark font-body transition-colors inline-flex items-center gap-1 mb-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Dashboard
              </Link>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark">
                All Briefs
              </h1>
            </div>
            <Btn onClick={() => navigate('/operator/brief/new')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Brief
            </Btn>
          </div>
        </FadeIn>

        {/* ── Filters Bar ───────────────────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white font-body text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-border bg-white font-body text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all min-w-[140px]"
              >
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-border bg-white font-body text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all min-w-[170px]"
              >
                {SORT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </FadeIn>

        {/* ── Results count ──────────────────────────────────────────────── */}
        <FadeIn delay={0.15}>
          <p className="text-sm text-muted font-body mb-4">
            {filtered.length} brief{filtered.length !== 1 ? 's' : ''}
            {statusFilter && ` with status "${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}"`}
            {search.trim() && ` matching "${search.trim()}"`}
          </p>
        </FadeIn>

        {/* ── Brief list ─────────────────────────────────────────────────── */}
        <FadeIn delay={0.2}>
          {filtered.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
              title={search.trim() || statusFilter ? 'No matching briefs' : 'No briefs yet'}
              description={
                search.trim() || statusFilter
                  ? 'Try adjusting your filters or search term.'
                  : 'Create your first brief to start attracting local creators.'
              }
              action={
                search.trim() || statusFilter ? (
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={() => { setSearch(''); setStatusFilter(''); }}
                  >
                    Clear Filters
                  </Btn>
                ) : (
                  <Btn onClick={() => navigate('/operator/brief/new')} size="sm">
                    Create Brief
                  </Btn>
                )
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((brief) => (
                <button
                  key={brief.id}
                  onClick={() => navigate(`/operator/brief/${brief.id}`)}
                  className="card w-full text-left hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-accent/20 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-body font-semibold text-dark truncate">
                          {brief.title}
                        </h3>
                        <StatusBadge status={brief.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted font-body">
                        {brief.campaignGoal && (
                          <span>{GOAL_LABELS[brief.campaignGoal] || brief.campaignGoal}</span>
                        )}
                        {brief.contentTypes && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                            </svg>
                            {formatContentTypes(brief.contentTypes)}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          {brief._count?.applications ?? 0} application{(brief._count?.applications ?? 0) !== 1 ? 's' : ''}
                        </span>
                        {brief.createdAt && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            {new Date(brief.createdAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
