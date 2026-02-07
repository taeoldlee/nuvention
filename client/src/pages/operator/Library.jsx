import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProjects } from '../../api';
import { CONTENT_TYPES, formatDate } from '../../utils/constants';
import Btn from '../../components/common/Btn';
import Chip from '../../components/common/Chip';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';

export default function Library() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const res = await getProjects();
        setProjects(res.data.projects || []);
      } catch (err) {
        setError('Could not load your content library.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Only show approved / delivered projects
  const completedProjects = useMemo(
    () =>
      projects.filter(
        (p) => p.status === 'APPROVED' || p.status === 'DELIVERED'
      ),
    [projects]
  );

  const getContentType = (p) =>
    p.match?.contentRequest?.contentType || p.contentType || '';

  const filteredProjects = useMemo(() => {
    if (!filter) return completedProjects;
    return completedProjects.filter((p) => getContentType(p) === filter);
  }, [completedProjects, filter]);

  // Collect unique content types that actually exist
  const availableTypes = useMemo(() => {
    const types = new Set(completedProjects.map((p) => getContentType(p)).filter(Boolean));
    return CONTENT_TYPES.filter((t) => types.has(t));
  }, [completedProjects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <LoadingSpinner message="Loading your library..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
          <div>
            <button
              onClick={() => navigate('/operator/dashboard')}
              className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Dashboard
            </button>
            <h1 className="font-display text-3xl font-bold text-dark mb-1">
              Content Library
            </h1>
            <p className="font-body text-muted">
              {completedProjects.length} piece{completedProjects.length !== 1 ? 's' : ''} of
              approved content
            </p>
          </div>
          <Btn onClick={() => navigate('/operator/request/new')} size="sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Request
          </Btn>
        </div>

        {/* Filter Chips */}
        {availableTypes.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <Chip
              label="All"
              selected={!filter}
              onClick={() => setFilter('')}
            />
            {availableTypes.map((type) => (
              <Chip
                key={type}
                label={type}
                selected={filter === type}
                onClick={() => setFilter((prev) => (prev === type ? '' : type))}
              />
            ))}
          </div>
        )}

        {error && (
          <div className="card text-center py-8 mb-6">
            <p className="text-red-600 font-body">{error}</p>
          </div>
        )}

        {/* Content Grid */}
        {filteredProjects.length === 0 ? (
          <EmptyState
            icon={
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
              </svg>
            }
            title={
              filter
                ? `No ${filter.toLowerCase()} content yet`
                : 'Your library is empty'
            }
            description="Approved content from completed projects will appear here."
            action={
              <Btn
                onClick={() => navigate('/operator/request/new')}
                size="sm"
              >
                Start a Content Request
              </Btn>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProjects.map((project) => {
              const latestDraft =
                project.drafts?.length > 0
                  ? project.drafts[project.drafts.length - 1]
                  : null;
              const draftImages = latestDraft?.fileUrls || latestDraft?.images || [];
              const thumbnail =
                project.thumbnailUrl ||
                (draftImages.length > 0
                  ? typeof draftImages[0] === 'string'
                    ? draftImages[0]
                    : draftImages[0]?.url
                  : null);

              return (
                <button
                  key={project.id}
                  onClick={() => navigate(`/operator/project/${project.id}`)}
                  className="group text-left"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square rounded-xl border border-border overflow-hidden bg-bgTan mb-3">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={getContentType(project)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-dark font-body truncate group-hover:text-accent transition-colors">
                        {getContentType(project) || 'Content'}
                      </p>
                      <p className="text-xs text-muted font-body">
                        {project.creatorProfile?.user?.name || project.creatorName || 'Creator'}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {project.completedAt ? (
                        <p className="text-xs text-muted font-body">
                          {formatDate(project.completedAt)}
                        </p>
                      ) : project.updatedAt ? (
                        <p className="text-xs text-muted font-body">
                          {formatDate(project.updatedAt)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  {/* Deliverables preview */}
                  {project.deliverables && (
                    <p className="text-xs text-muted font-body mt-1 truncate">
                      {Array.isArray(project.deliverables)
                        ? project.deliverables.join(' \u00B7 ')
                        : project.deliverables}
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
