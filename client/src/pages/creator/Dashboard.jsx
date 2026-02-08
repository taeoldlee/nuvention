import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getCreatorStats, getProjects, getBriefs } from '../../api';
import { formatCents } from '../../utils/constants';
import StatCard from '../../components/common/StatCard';
import EmptyState from '../../components/common/EmptyState';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import CreatorBriefCard from '../../components/creator/CreatorBriefCard';
import CreatorProjectCard from '../../components/creator/CreatorProjectCard';

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [stats, setStats] = useState(null);
  const [briefs, setBriefs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const [statsRes, briefsRes, projectsRes] = await Promise.allSettled([
          getCreatorStats(),
          getBriefs(),
          getProjects(),
        ]);

        if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
        if (briefsRes.status === 'fulfilled') setBriefs(briefsRes.value.data?.briefs || []);
        if (projectsRes.status === 'fulfilled') setProjects(projectsRes.value.data?.projects || []);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." creator />;
  }

  const displayName = profile?.displayName || 'Creator';
  const neighborhood = profile?.neighborhoods?.[0] || '';
  const style = profile?.contentStyles?.[0] || '';
  const subtitle = [neighborhood, style].filter(Boolean).join(' \u00B7 ');

  const monthlyEarnings = stats?.monthlyEarnings ?? 0;
  const activeCount = stats?.activeProjects ?? projects.filter((p) => !['DELIVERED', 'APPROVED'].includes(p.status)).length;
  const newBriefsCount = stats?.newBriefs ?? briefs.length;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700 font-body">{error}</p>
        </div>
      )}

      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-dark mb-1">
          Hey, {displayName}
        </h1>
        {subtitle && (
          <p className="font-body text-muted text-sm flex items-center gap-1.5">
            <svg className="w-4 h-4 text-creatorAccent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            {subtitle}
          </p>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Monthly Earnings"
          value={formatCents(monthlyEarnings)}
          creator
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
        <StatCard
          label="Active Projects"
          value={activeCount}
          creator
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>}
        />
        <StatCard
          label="New Briefs"
          value={newBriefsCount}
          creator
          icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
        />
      </div>

      {/* Incoming Briefs */}
      <section className="mb-10">
        <h2 className="font-display text-xl font-bold text-dark mb-4">
          Incoming Briefs
        </h2>

        {briefs.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>}
              title="No new briefs yet"
              description="When brands match with your style, briefs will appear here."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {briefs.map((brief) => (
              <CreatorBriefCard
                key={brief.matchId || brief.id || brief._id}
                brief={brief}
                onClick={() => navigate(`/creator/brief/${brief.matchId || brief.id || brief._id}`)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Active Projects */}
      <section>
        <h2 className="font-display text-xl font-bold text-dark mb-4">
          Active Projects
        </h2>

        {projects.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3 21h18M3 21a2.25 2.25 0 01-2.25-2.25V5.25A2.25 2.25 0 013 3h18a2.25 2.25 0 012.25 2.25v13.5A2.25 2.25 0 0121 21" /></svg>}
              title="No active projects"
              description="When you accept a brief, your projects will appear here."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <CreatorProjectCard
                key={project.id || project._id}
                project={project}
                onClick={() => navigate(`/creator/project/${project.id || project._id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
