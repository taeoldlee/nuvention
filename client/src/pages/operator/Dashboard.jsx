import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getBrandStats, getBriefs, getProjects } from '../../api';
import Btn from '../../components/common/Btn';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import FadeIn from '../../components/marketing/FadeIn';
import { DashboardSkeleton } from '../../components/common/Skeleton';

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

// ─── Dashboard ───────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();

  const [stats, setStats] = useState(null);
  const [briefs, setBriefs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [statsRes, briefsRes, projectsRes] = await Promise.all([
          getBrandStats(),
          getBriefs(),
          getProjects(),
        ]);
        setStats(statsRes.data);
        setBriefs(briefsRes.data.briefs || []);
        setProjects(projectsRes.data.projects || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Could not load your dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id, profile]);

  // ── Derived data ──────────────────────────────────────────────────────────
  const activeProjects = projects.filter(
    (p) => !['COMPLETED', 'CANCELLED'].includes(p.status)
  );

  // ── Early returns (all hooks above) ───────────────────────────────────────

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

        {/* ── Welcome Header ─────────────────────────────────────────── */}
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
            <Btn onClick={() => navigate('/operator/brief/new')}>
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Create Brief
            </Btn>
          </div>
        </FadeIn>

        {/* ── Stats Row ──────────────────────────────────────────────── */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Active Briefs"
              value={stats?.activeBriefs ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
            />
            <StatCard
              label="Total Applications"
              value={stats?.totalApplications ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
            />
            <StatCard
              label="Active Projects"
              value={stats?.activeProjects ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              }
            />
            <StatCard
              label="Completed"
              value={stats?.completedProjects ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </FadeIn>

        {/* ── Recent Briefs ──────────────────────────────────────────── */}
        <FadeIn delay={0.2}>
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-dark">
                Recent Briefs
              </h2>
              {briefs.length > 0 && (
                <span className="text-sm text-muted font-body">
                  {briefs.length} brief{briefs.length !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {briefs.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                }
                title="No briefs yet"
                description="Create your first brief to start attracting local creators."
                action={
                  <Btn onClick={() => navigate('/operator/brief/new')} size="sm">
                    Create Brief
                  </Btn>
                }
              />
            ) : (
              <div className="space-y-3">
                {briefs.map((brief) => (
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

        {/* ── Active Projects ────────────────────────────────────────── */}
        <FadeIn delay={0.3}>
          <section>
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

            {activeProjects.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                }
                title="No active projects"
                description="When creators are selected from your briefs, active projects will appear here."
              />
            ) : (
              <div className="space-y-3">
                {activeProjects.map((project) => (
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
                        <div className="flex items-center gap-3 text-sm text-muted font-body">
                          {project.application?.creatorName && (
                            <span className="flex items-center gap-1">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                              </svg>
                              {project.application.creatorName}
                            </span>
                          )}
                          {project.createdAt && (
                            <span>
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
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
