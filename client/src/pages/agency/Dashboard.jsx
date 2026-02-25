import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAgencyStats, getAgencyBriefs, getAgencyApplications } from '../../api';
import Btn from '../../components/common/Btn';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import EmptyState from '../../components/common/EmptyState';
import FadeIn from '../../components/marketing/FadeIn';

const COMPENSATION_LABELS = {
  FREE_PRODUCT: 'Free Product',
  FLAT_FEE: 'Flat Fee',
  HYBRID: 'Hybrid',
  COMMISSION: 'Commission',
};

export default function AgencyDashboard() {
  const navigate = useNavigate();
  const { user, profile, isAgency, hasProfile } = useAuth();

  const [stats, setStats] = useState(null);
  const [briefs, setBriefs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!hasProfile) return;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const [statsRes, briefsRes, appsRes] = await Promise.all([
          getAgencyStats(),
          getAgencyBriefs(),
          getAgencyApplications(),
        ]);
        setStats(statsRes.data);
        setBriefs(briefsRes.data.briefs || []);
        setApplications(appsRes.data.applications || []);
      } catch (err) {
        console.error('Dashboard load error:', err);
        setError('Could not load your dashboard. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id, hasProfile]);

  if (!user || !isAgency) return <Navigate to="/" replace />;
  if (!hasProfile) return <Navigate to="/agency/onboarding" replace />;

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded-xl w-64" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-2xl" />)}
            </div>
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
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

  const recentApps = applications.slice(0, 5);

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Welcome Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
            <div>
              <p className="section-label mb-2">Agency Dashboard</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark mb-1">
                Welcome back{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
              </h1>
              {profile?.agencyName && (
                <p className="font-body text-muted">{profile.agencyName}</p>
              )}
            </div>
            <Btn onClick={() => navigate('/agency/roster')} className="!bg-purple-600 hover:!bg-purple-700">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
              </svg>
              Manage Roster
            </Btn>
          </div>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <StatCard
              label="Roster Size"
              value={stats?.rosterCount ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                </svg>
              }
            />
            <StatCard
              label="Total Applications"
              value={stats?.totalApplications ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              }
            />
            <StatCard
              label="Pending"
              value={stats?.pendingApplications ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <StatCard
              label="Selected"
              value={stats?.selectedApplications ?? 0}
              icon={
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
          </div>
        </FadeIn>

        {/* Open Briefs */}
        <FadeIn delay={0.2}>
          <section className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-dark">Open Briefs</h2>
              <span className="text-sm text-muted font-body">{briefs.length} available</span>
            </div>

            {briefs.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                }
                title="No open briefs"
                description="Check back soon for new campaign opportunities."
              />
            ) : (
              <div className="space-y-3">
                {briefs.map((brief) => (
                  <button
                    key={brief.id}
                    onClick={() => navigate(`/agency/brief/${brief.id}`)}
                    className="card w-full text-left hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-purple-200 hover:-translate-y-0.5 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-body font-semibold text-dark truncate">{brief.title}</h3>
                          <StatusBadge status={brief.status} />
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted font-body">
                          <span>{brief.brandProfile?.businessName}</span>
                          <span>{brief.brandProfile?.neighborhood}, {brief.brandProfile?.city}</span>
                          {brief.compensationType && (
                            <span>{COMPENSATION_LABELS[brief.compensationType] || brief.compensationType}</span>
                          )}
                          <span>{brief._count?.applications ?? 0} applicant{(brief._count?.applications ?? 0) !== 1 ? 's' : ''}</span>
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

        {/* Recent Applications */}
        <FadeIn delay={0.3}>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-dark">Recent Applications</h2>
              {applications.length > 0 && (
                <span className="text-sm text-muted font-body">{applications.length} total</span>
              )}
            </div>

            {recentApps.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                }
                title="No applications yet"
                description="Browse open briefs and submit creators to get started."
              />
            ) : (
              <div className="space-y-3">
                {recentApps.map((app) => (
                  <div
                    key={app.id}
                    className="card"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="font-body font-semibold text-dark truncate">
                            {app.agencyCreator?.name || app.creatorName}
                          </h3>
                          <StatusBadge status={app.status} />
                        </div>
                        <p className="text-sm text-muted font-body">
                          {app.brief?.title} &middot; {app.brief?.brandProfile?.businessName}
                        </p>
                      </div>
                      <p className="text-xs text-muted whitespace-nowrap">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </FadeIn>
      </div>
    </div>
  );
}
