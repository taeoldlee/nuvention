import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProject,
  approveDraft,
  requestRevision,
  deliverProject,
} from '../../api';
import {
  formatCompensation,
  formatDate,
} from '../../utils/constants';
import { creatorDisplayName, creatorPhotoUrl } from '../../utils/extractors';
import ProjectStatusTracker from '../../components/common/ProjectStatusTracker';
import StatusBadge from '../../components/common/StatusBadge';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import DraftReviewSection from '../../components/operator/DraftReviewSection';
import {
  BriefSentSection,
  RevisionRequestedSection,
  ApprovedSection,
  DeliveredSection,
} from '../../components/operator/ProjectStatusSection';
import DraftHistory from '../../components/operator/DraftHistory';

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const loadProject = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProject(id);
      setProject(res.data.project);
    } catch {
      setError('Could not load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProject(); }, [id]);

  const handleApprove = async (draftId) => {
    setActionLoading('approve');
    try {
      await approveDraft(id, draftId);
      await loadProject();
    } catch {
      setError('Could not approve draft.');
    } finally {
      setActionLoading('');
    }
  };

  const handleRevision = async (draftId, notes) => {
    setActionLoading('revision');
    try {
      await requestRevision(id, draftId, notes);
      await loadProject();
    } catch {
      setError('Could not request revision.');
    } finally {
      setActionLoading('');
    }
  };

  const handleDeliver = async () => {
    setActionLoading('deliver');
    try {
      const res = await deliverProject(id);
      setProject(res.data.project);
    } catch {
      setError('Could not mark project as delivered.');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <LoadingSpinner message="Loading project..." />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 font-body mb-4">{error}</p>
            <Btn onClick={() => navigate('/operator/dashboard')}>Back to Dashboard</Btn>
          </div>
        </div>
      </div>
    );
  }

  const contentType = project.match?.contentRequest?.contentType || project.contentType || 'Content Project';
  const creatorName = creatorDisplayName(project);
  const creatorPhoto = creatorPhotoUrl(project);
  const compensationType = project.compensationType || 'FLAT_FEE';
  const compensationDetails = project.compensationDetails || null;
  const latestDraft = project.drafts?.length > 0 ? project.drafts[0] : null;
  const isDraftReview = project.status === 'DRAFT_SUBMITTED' && latestDraft;

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate('/operator/dashboard')}
          className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Dashboard
        </button>

        {/* Project Header */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1">
              {creatorPhoto ? (
                <img src={creatorPhoto} alt={creatorName} className="w-12 h-12 rounded-full object-cover border-2 border-border" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accentLight flex items-center justify-center">
                  <span className="text-lg font-bold text-accent">{creatorName?.charAt(0) || '?'}</span>
                </div>
              )}
              <div>
                <h1 className="font-display text-xl font-bold text-dark">{contentType}</h1>
                <p className="text-sm text-muted font-body">
                  {creatorName && `by ${creatorName}`}
                  {project.createdAt && ` \u00B7 Started ${formatDate(project.createdAt)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={project.status} />
              {project.timeline && <span className="text-sm text-muted font-body">{project.timeline}</span>}
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="card mb-6">
          <ProjectStatusTracker status={project.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Details */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card space-y-4">
              <h2 className="font-display text-lg font-semibold text-dark">Project Details</h2>

              {project.deliverables && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Deliverables</p>
                  {Array.isArray(project.deliverables) ? (
                    <ul className="space-y-1">
                      {project.deliverables.map((d, i) => (
                        <li key={typeof d === 'string' ? d : i} className="flex items-center gap-2 text-sm text-dark font-body">
                          <svg className="w-3.5 h-3.5 text-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {d}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-dark font-body">{project.deliverables}</p>
                  )}
                </div>
              )}

              {project.price != null && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Compensation</p>
                  <p className="text-2xl font-bold text-dark font-body">
                    {formatCompensation(compensationType, compensationDetails, project.price)}
                  </p>
                </div>
              )}

              {project.usageRights && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Usage Rights</p>
                  <p className="text-sm text-dark font-body">{project.usageRights}</p>
                </div>
              )}

              {project.briefText && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Brief</p>
                  <p className="text-sm text-dark font-body leading-relaxed">{project.briefText}</p>
                </div>
              )}

              {project.usageRightsDoc && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Usage Rights Document</p>
                  <pre className="text-xs text-mid font-body whitespace-pre-wrap bg-bgWarm rounded-xl p-3 border border-border">
                    {project.usageRightsDoc}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Right: Draft Review / Status */}
          <div className="lg:col-span-2 space-y-6">
            {isDraftReview && (
              <DraftReviewSection
                draft={latestDraft}
                error={error}
                onApprove={handleApprove}
                onRevision={handleRevision}
                actionLoading={actionLoading}
              />
            )}

            {project.status === 'REVISION_REQUESTED' && <RevisionRequestedSection />}
            {project.status === 'BRIEF_SENT' && <BriefSentSection />}

            {project.status === 'APPROVED' && (
              <ApprovedSection
                onDeliver={handleDeliver}
                actionLoading={actionLoading}
                latestDraft={latestDraft}
              />
            )}

            {project.status === 'DELIVERED' && (
              <DeliveredSection navigate={navigate} latestDraft={latestDraft} />
            )}

            <DraftHistory drafts={project.drafts} />
          </div>
        </div>
      </div>
    </div>
  );
}
