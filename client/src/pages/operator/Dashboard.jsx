import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getOperatorStats, getProjects } from '../../api';
import {
  PROJECT_STATUS_LABELS,
  formatRelativeDate,
  parseRightsDuration,
} from '../../utils/constants';
import Chip from '../../components/common/Chip';
import { creatorDisplayName } from '../../utils/extractors';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import Btn from '../../components/common/Btn';
import { DashboardSkeleton } from '../../components/common/Skeleton';
import EmptyState from '../../components/common/EmptyState';
import FadeIn from '../../components/marketing/FadeIn';
import { useTour } from '../../contexts/TourContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { startTour, shouldAutoStart } = useTour();

  useEffect(() => {
    if (!profile) return;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const [statsRes, projectsRes] = await Promise.all([
          getOperatorStats(),
          getProjects(),
        ]);
        setStats(statsRes.data);
        setProjects(projectsRes.data.projects || []);
      } catch (err) {
        setError('Could not load your dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user?.id, profile]);

  useEffect(() => {
    if (!loading && profile && user?.id && shouldAutoStart(user.id)) {
      const timer = setTimeout(() => startTour('operator', user.id), 800);
      return () => clearTimeout(timer);
    }
  }, [loading, profile, user?.id, shouldAutoStart, startTour]);

  const activeProjects = projects.filter(
    (p) => !['DELIVERED', 'CANCELLED'].includes(p.status)
  );
  const approvedContent = projects.filter(
    (p) => p.status === 'APPROVED' || p.status === 'DELIVERED'
  );

  // Find projects with expiring usage rights (within 30 days)
  const expiringProjects = useMemo(() => {
    return projects.filter((p) => {
      if (p.status !== 'DELIVERED' && p.status !== 'APPROVED') return false;
      const months = parseRightsDuration(p.usageRights);
      const deliveredAt = new Date(p.updatedAt);
      const expiresAt = new Date(deliveredAt);
      expiresAt.setMonth(expiresAt.getMonth() + months);
      const daysLeft = (expiresAt - new Date()) / (1000 * 60 * 60 * 24);
      return daysLeft <= 30 && daysLeft > -Infinity;
    });
  }, [projects]);

  // Filtered active projects
  const filteredActive = useMemo(() => {
    let result = activeProjects;
    if (statusFilter) {
      result = result.filter((p) => p.status === statusFilter);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) =>
        (creatorDisplayName(p) || '').toLowerCase().includes(q) ||
        (p.match?.contentRequest?.contentType || '').toLowerCase().includes(q) ||
        (p.status || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [activeProjects, search, statusFilter]);

  // --- All hooks above, early returns below ---

  if (user && !profile) {
    return <Navigate to="/operator/onboarding" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

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
        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
            <div>
              <p className="section-label mb-2">Dashboard</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark mb-1">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </h1>
              {profile?.businessName && (
                <p className="font-body text-muted">{profile.businessName}</p>
              )}
            </div>
            <Btn data-tour="operator-new-request" onClick={() => navigate('/operator/request/new')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              New Content Request
            </Btn>
          </div>
        </FadeIn>

        {/* Stats Row */}
        <FadeIn delay={0.1}>
        <div data-tour="operator-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <StatCard
            label="Active Projects"
            value={stats?.activeProjects ?? activeProjects.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            }
          />
          <StatCard
            label="Content Library"
            value={stats?.contentLibrary ?? approvedContent.length}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            }
          />
          <StatCard
            label="Posting Rate"
            value={stats?.postingRate ? `${stats.postingRate}%` : '--'}
            icon={
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            }
          />
        </div>
        </FadeIn>

        {/* Usage Rights Alert */}
        {expiringProjects.length > 0 && (
          <FadeIn delay={0.15}>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-orange-800 font-body">Usage Rights Expiring</p>
                <p className="text-sm text-orange-700 font-body">
                  {expiringProjects.length} project{expiringProjects.length !== 1 ? 's have' : ' has'} usage rights expiring within 30 days.{' '}
                  <button onClick={() => navigate('/operator/library')} className="underline font-semibold">View in Library</button>
                </p>
              </div>
            </div>
          </div>
          </FadeIn>
        )}

        {/* Active Projects */}
        <FadeIn delay={0.2}>
        <section data-tour="operator-active-projects" className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-dark">
              Active Projects
            </h2>
            {activeProjects.length > 0 && (
              <span className="text-sm text-muted font-body">
                {activeProjects.length} project{activeProjects.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Search + Filter */}
          {activeProjects.length > 0 && (
            <div className="mb-4 space-y-3">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by creator, content type..."
                aria-label="Search active projects"
                className="input w-full text-sm"
              />
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'All', value: '' },
                  { label: 'Brief Sent', value: 'BRIEF_SENT' },
                  { label: 'Draft Submitted', value: 'DRAFT_SUBMITTED' },
                  { label: 'Revision', value: 'REVISION_REQUESTED' },
                  { label: 'Approved', value: 'APPROVED' },
                ].map((f) => (
                  <Chip
                    key={f.value}
                    label={f.label}
                    selected={statusFilter === f.value}
                    onClick={() => setStatusFilter(f.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredActive.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                </svg>
              }
              title="No active projects yet"
              description="Start a content request to get matched with local creators."
              action={
                <Btn onClick={() => navigate('/operator/request/new')} size="sm">
                  New Content Request
                </Btn>
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredActive.map((project) => (
                <button
                  key={project.id}
                  onClick={() => navigate(`/operator/project/${project.id}`)}
                  className="card w-full text-left hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-accent/20 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-body font-semibold text-dark truncate">
                          {project.match?.contentRequest?.contentType || project.contentType || 'Content Project'}
                        </h3>
                        <StatusBadge status={project.status} />
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted font-body">
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                          {creatorDisplayName(project)}
                        </span>
                        {project.updatedAt && (
                          <span>Updated {formatRelativeDate(project.updatedAt)}</span>
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
        </section>
        </FadeIn>

        {/* Recent Content */}
        <FadeIn delay={0.3}>
        <section data-tour="operator-recent-content">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold text-dark">
              Recent Content
            </h2>
            {approvedContent.length > 0 && (
              <button
                onClick={() => navigate('/operator/library')}
                className="text-sm text-accent font-semibold font-body hover:text-accent/80 transition-colors"
              >
                View all
              </button>
            )}
          </div>

          {approvedContent.length === 0 ? (
            <EmptyState
              icon={
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                </svg>
              }
              title="Your content library is empty"
              description="Approved content from completed projects will appear here."
            />
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide">
              {approvedContent.slice(0, 8).map((project) => {
                const thumbUrl = project.thumbnailUrl || (project.drafts?.[0]?.fileUrls?.[0]) || null;
                return (
                <button
                  key={project.id}
                  onClick={() => navigate(`/operator/project/${project.id}`)}
                  className="flex-shrink-0 w-48 group"
                >
                  <div className="w-48 h-48 rounded-xl bg-bgTan border border-border overflow-hidden mb-2">
                    {thumbUrl ? (
                      <img
                        src={thumbUrl}
                        alt={project.match?.contentRequest?.contentType || project.contentType}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-dark font-body truncate">
                    {project.match?.contentRequest?.contentType || project.contentType}
                  </p>
                  <p className="text-xs text-muted font-body">
                    {creatorDisplayName(project)}
                  </p>
                </button>
                );
              })}
            </div>
          )}
        </section>
        </FadeIn>
      </div>
    </div>
  );
}
