import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProject,
  approveDraft,
  requestRevision,
  deliverProject,
} from '../../api';
import {
  formatCents,
  formatDate,
  PROJECT_STATUS_LABELS,
} from '../../utils/constants';
import ProjectStatusTracker from '../../components/common/ProjectStatusTracker';
import StatusBadge from '../../components/common/StatusBadge';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState('');

  const loadProject = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getProject(id);
      setProject(res.data.project);
    } catch (err) {
      setError('Could not load project details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
  }, [id]);

  const handleApprove = async (draftId) => {
    setActionLoading('approve');
    try {
      await approveDraft(id, draftId);
      // Reload full project since approve returns { draft }
      await loadProject();
    } catch (err) {
      setError('Could not approve draft.');
    } finally {
      setActionLoading('');
    }
  };

  const handleRevision = async (draftId) => {
    if (!revisionNotes.trim()) return;
    setActionLoading('revision');
    try {
      await requestRevision(id, draftId, revisionNotes.trim());
      // Reload full project since revision returns { draft }
      await loadProject();
      setShowRevisionInput(false);
      setRevisionNotes('');
    } catch (err) {
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
    } catch (err) {
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
            <Btn onClick={() => navigate('/operator/dashboard')}>
              Back to Dashboard
            </Btn>
          </div>
        </div>
      </div>
    );
  }

  // Derive display fields from nested data
  const contentType = project.match?.contentRequest?.contentType || project.contentType || 'Content Project';
  const creatorName = project.creatorProfile?.user?.name || project.creatorName || '';
  const creatorPhotoUrl = project.creatorProfile?.user?.avatarUrl || project.creatorPhotoUrl || null;
  const compensationType = project.compensationType || 'FLAT_FEE';
  const compensationDetails = project.compensationDetails || null;

  const formatCompensation = (type, details, price) => {
    if (type === 'FREE_PRODUCT') return details?.note ? `Free product: ${details.note}` : 'Free product/meal';
    if (type === 'DISCOUNT_CODE') return details?.note ? `Discount: ${details.note}` : 'Discount code';
    if (type === 'HYBRID') {
      const cash = details?.minCents ? `$${(details.minCents / 100).toFixed(0)}+` : '$';
      const note = details?.note ? details.note : 'product/benefit';
      return `${cash} ${note}`;
    }
    if (price != null) return formatCents(price);
    return 'Flat fee';
  };

  const latestDraft =
    project.drafts?.length > 0
      ? project.drafts[0]
      : null;

  const isDraftReview = project.status === 'DRAFT_SUBMITTED' && latestDraft;
  const isRevisionRequested = project.status === 'REVISION_REQUESTED';
  const isApproved = project.status === 'APPROVED';
  const isDelivered = project.status === 'DELIVERED';

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
            {/* Creator Info */}
            <div className="flex items-center gap-3 flex-1">
              {creatorPhotoUrl ? (
                <img
                  src={creatorPhotoUrl}
                  alt={creatorName}
                  className="w-12 h-12 rounded-full object-cover border-2 border-border"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-accentLight flex items-center justify-center">
                  <span className="text-lg font-bold text-accent">
                    {creatorName?.charAt(0) || '?'}
                  </span>
                </div>
              )}
              <div>
                <h1 className="font-display text-xl font-bold text-dark">
                  {contentType}
                </h1>
                <p className="text-sm text-muted font-body">
                  {creatorName && `by ${creatorName}`}
                  {project.createdAt && ` \u00B7 Started ${formatDate(project.createdAt)}`}
                </p>
              </div>
            </div>

            {/* Status & Timeline */}
            <div className="flex items-center gap-3">
              <StatusBadge status={project.status} />
              {project.timeline && (
                <span className="text-sm text-muted font-body">
                  {project.timeline}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="card mb-6">
          <ProjectStatusTracker status={project.status} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: Details */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Details */}
            <div className="card space-y-4">
              <h2 className="font-display text-lg font-semibold text-dark">
                Project Details
              </h2>

              {project.deliverables && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                    Deliverables
                  </p>
                  {Array.isArray(project.deliverables) ? (
                    <ul className="space-y-1">
                      {project.deliverables.map((d, i) => (
                        <li
                          key={i}
                          className="flex items-center gap-2 text-sm text-dark font-body"
                        >
                          <svg className="w-3.5 h-3.5 text-green flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {d}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-dark font-body">
                      {project.deliverables}
                    </p>
                  )}
                </div>
              )}

              {project.price != null && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                    Compensation
                  </p>
                  <p className="text-2xl font-bold text-dark font-body">
                    {formatCompensation(compensationType, compensationDetails, project.price)}
                  </p>
                </div>
              )}

              {project.usageRights && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                    Usage Rights
                  </p>
                  <p className="text-sm text-dark font-body">
                    {project.usageRights}
                  </p>
                </div>
              )}

              {project.briefText && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                    Brief
                  </p>
                  <p className="text-sm text-dark font-body leading-relaxed">
                    {project.briefText}
                  </p>
                </div>
              )}

              {project.usageRightsDoc && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                    Usage Rights Document
                  </p>
                  <pre className="text-xs text-mid font-body whitespace-pre-wrap bg-bgWarm rounded-xl p-3 border border-border">
                    {project.usageRightsDoc}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Right column: Draft Review / Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Draft Review Section */}
            {isDraftReview && latestDraft && (
              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-lg font-semibold text-dark">
                    Draft for Review
                  </h2>
                  <span className="text-xs text-muted font-body">
                    {latestDraft.submittedAt &&
                      `Submitted ${formatDate(latestDraft.submittedAt)}`}
                  </span>
                </div>

                {/* Draft Images */}
                {(latestDraft.fileUrls || latestDraft.images)?.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                    {(latestDraft.fileUrls || latestDraft.images).map((img, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl border border-border overflow-hidden bg-bgTan"
                      >
                        <img
                          src={typeof img === 'string' ? img : img.url}
                          alt={`Draft ${i + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Creator Notes */}
                {latestDraft.notes && (
                  <div className="bg-bgWarm rounded-xl p-4 mb-4">
                    <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                      Creator Notes
                    </p>
                    <p className="text-sm text-dark font-body leading-relaxed">
                      {latestDraft.notes}
                    </p>
                  </div>
                )}

                {error && (
                  <p className="text-sm text-red-600 font-body mb-4">{error}</p>
                )}

                {/* Revision Input */}
                {showRevisionInput && (
                  <div className="bg-bgWarm rounded-xl p-4 mb-4">
                    <label className="block text-sm font-medium text-dark mb-1.5 font-body">
                      Revision notes
                    </label>
                    <textarea
                      value={revisionNotes}
                      onChange={(e) => setRevisionNotes(e.target.value)}
                      rows={3}
                      placeholder="Describe what you'd like changed..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none mb-3"
                    />
                    <div className="flex gap-2">
                      <Btn
                        size="sm"
                        onClick={() => handleRevision(latestDraft.id)}
                        loading={actionLoading === 'revision'}
                        disabled={!revisionNotes.trim()}
                      >
                        Send Revision Request
                      </Btn>
                      <Btn
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setShowRevisionInput(false);
                          setRevisionNotes('');
                        }}
                      >
                        Cancel
                      </Btn>
                    </div>
                  </div>
                )}

                {/* Action CTAs */}
                {!showRevisionInput && (
                  <div className="flex gap-3">
                    <Btn
                      onClick={() => handleApprove(latestDraft.id)}
                      loading={actionLoading === 'approve'}
                      className="flex-1"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Approve
                    </Btn>
                    <Btn
                      variant="secondary"
                      onClick={() => setShowRevisionInput(true)}
                      className="flex-1"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                      </svg>
                      Request Revision
                    </Btn>
                  </div>
                )}
              </div>
            )}

            {/* Revision Requested State */}
            {isRevisionRequested && (
              <div className="card">
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-yellowBg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-7 h-7 text-yellowText" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-dark mb-2">
                    Revision requested
                  </h3>
                  <p className="text-sm text-muted font-body max-w-md mx-auto">
                    The creator has been notified and is working on your changes. You'll
                    get an updated draft soon.
                  </p>
                </div>
              </div>
            )}

            {/* Brief Sent State */}
            {project.status === 'BRIEF_SENT' && (
              <div className="card">
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-yellowBg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-7 h-7 text-yellowText" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-dark mb-2">
                    Brief sent to creator
                  </h3>
                  <p className="text-sm text-muted font-body max-w-md mx-auto">
                    The creator has received your brief and will start working on your
                    content shortly.
                  </p>
                </div>
              </div>
            )}

            {/* Approved State */}
            {isApproved && (
              <div className="card">
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-greenBg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-dark mb-2">
                    Content approved
                  </h3>
                  <p className="text-sm text-muted font-body max-w-md mx-auto mb-6">
                    You approved this content. Mark it as delivered when you've posted it.
                  </p>
                  <Btn
                    onClick={handleDeliver}
                    loading={actionLoading === 'deliver'}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Mark as Delivered
                  </Btn>
                </div>

                {/* Show approved images */}
                {(latestDraft?.fileUrls || latestDraft?.images)?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm font-medium text-dark font-body mb-3">
                      Approved content
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(latestDraft.fileUrls || latestDraft.images).map((img, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl border border-border overflow-hidden bg-bgTan"
                        >
                          <img
                            src={typeof img === 'string' ? img : img.url}
                            alt={`Approved ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Delivered State */}
            {isDelivered && (
              <div className="card">
                <div className="text-center py-8">
                  <div className="w-14 h-14 rounded-2xl bg-greenBg mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-7 h-7 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-dark mb-2">
                    Project complete
                  </h3>
                  <p className="text-sm text-muted font-body max-w-md mx-auto mb-6">
                    This content has been delivered. You can find it in your content library.
                  </p>
                  <Btn
                    variant="secondary"
                    onClick={() => navigate('/operator/library')}
                  >
                    View Library
                  </Btn>
                </div>

                {/* Show delivered images */}
                {(latestDraft?.fileUrls || latestDraft?.images)?.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <p className="text-sm font-medium text-dark font-body mb-3">
                      Delivered content
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(latestDraft.fileUrls || latestDraft.images).map((img, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-xl border border-border overflow-hidden bg-bgTan"
                        >
                          <img
                            src={typeof img === 'string' ? img : img.url}
                            alt={`Delivered ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Draft History */}
            {project.drafts?.length > 1 && (
              <div className="card">
                <h2 className="font-display text-lg font-semibold text-dark mb-4">
                  Draft History
                </h2>
                <div className="space-y-3">
                  {project.drafts
                    .slice(1)
                    .map((draft, i) => (
                      <div
                        key={draft.id || i}
                        className="bg-bgWarm rounded-xl p-4"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-dark font-body">
                            Draft {project.drafts.length - 1 - i}
                          </span>
                          {draft.submittedAt && (
                            <span className="text-xs text-muted font-body">
                              {formatDate(draft.submittedAt)}
                            </span>
                          )}
                        </div>
                        {(draft.fileUrls || draft.images)?.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto">
                            {(draft.fileUrls || draft.images).map((img, j) => (
                              <img
                                key={j}
                                src={typeof img === 'string' ? img : img.url}
                                alt={`Draft ${project.drafts.length - 1 - i} - ${j + 1}`}
                                className="w-16 h-16 rounded-lg object-cover flex-shrink-0 border border-border"
                              />
                            ))}
                          </div>
                        )}
                        {draft.feedback && (
                          <p className="text-xs text-muted font-body mt-2">
                            Feedback: {draft.feedback}
                          </p>
                        )}
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
