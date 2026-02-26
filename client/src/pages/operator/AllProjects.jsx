import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getProjects } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import Btn from '../../components/common/Btn';
import FadeIn from '../../components/marketing/FadeIn';
import { SkeletonGrid } from '../../components/common/Skeleton';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'AWAITING_CREATOR_ACCEPTANCE', label: 'Awaiting Acceptance' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DRAFT_SUBMITTED', label: 'Draft Submitted' },
  { value: 'REVISION_REQUESTED', label: 'Revision Requested' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const SORT_OPTIONS = [
  { value: 'date-desc', label: 'Newest First' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'status', label: 'Status' },
];

const STATUS_ORDER = {
  DRAFT_SUBMITTED: 0,
  REVISION_REQUESTED: 1,
  IN_PROGRESS: 2,
  AWAITING_CREATOR_ACCEPTANCE: 3,
  ACCEPTED: 4,
  APPROVED: 5,
  COMPLETED: 6,
  CANCELLED: 7,
};

export default function AllProjects() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [projects, setProjects] = useState([]);
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
        const res = await getProjects();
        setProjects(res.data.projects || []);
      } catch (err) {
        console.error('AllProjects load error:', err);
        setError('Could not load projects. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id, profile]);

  // ── Filtered + sorted data ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...projects];

    // Status filter
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Search by creator name or brief title
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter((p) => {
        const creatorName = p.application?.creatorName?.toLowerCase() || '';
        const briefTitle = p.application?.brief?.title?.toLowerCase() || '';
        return creatorName.includes(q) || briefTitle.includes(q);
      });
    }

    // Sort
    const [sortKey, sortDir] = sort.split('-');
    result.sort((a, b) => {
      if (sortKey === 'date') {
        const da = new Date(a.createdAt).getTime();
        const db = new Date(b.createdAt).getTime();
        return sortDir === 'desc' ? db - da : da - db;
      }
      if (sortKey === 'status') {
        return (STATUS_ORDER[a.status] ?? 9) - (STATUS_ORDER[b.status] ?? 9);
      }
      return 0;
    });

    return result;
  }, [projects, statusFilter, search, sort]);

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
                All Projects
              </h1>
            </div>
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
                  placeholder="Search by creator or brief title..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-white font-body text-sm text-dark placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-border bg-white font-body text-sm text-dark focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/40 transition-all min-w-[180px]"
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
            {filtered.length} project{filtered.length !== 1 ? 's' : ''}
            {statusFilter && ` with status "${STATUS_OPTIONS.find((o) => o.value === statusFilter)?.label}"`}
            {search.trim() && ` matching "${search.trim()}"`}
          </p>
        </FadeIn>

        {/* ── Project list ───────────────────────────────────────────────── */}
        <FadeIn delay={0.2}>
          {filtered.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              }
              title={search.trim() || statusFilter ? 'No matching projects' : 'No projects yet'}
              description={
                search.trim() || statusFilter
                  ? 'Try adjusting your filters or search term.'
                  : 'When creators are selected from your briefs, projects will appear here.'
              }
              action={
                (search.trim() || statusFilter) ? (
                  <Btn
                    variant="secondary"
                    size="sm"
                    onClick={() => { setSearch(''); setStatusFilter(''); }}
                  >
                    Clear Filters
                  </Btn>
                ) : null
              }
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/operator/project/${project.id}`)}
                  className="card w-full text-left hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-accent/20 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-body font-semibold text-dark truncate">
                          {project.application?.brief?.title || 'Content Project'}
                        </h3>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted font-body">
                        {project.application?.creatorName && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                            </svg>
                            {project.application.creatorName}
                          </span>
                        )}
                        {project.createdAt && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                            Started {new Date(project.createdAt).toLocaleDateString()}
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
