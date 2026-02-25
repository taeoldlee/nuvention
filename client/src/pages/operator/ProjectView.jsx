import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProject,
  approveDraft,
  requestRevision,
  completeProject,
  getProjectMessages,
  sendProjectMessage,
} from '../../api';
import { formatDate, formatCents, formatCompensation } from '../../utils/constants';
import Btn from '../../components/common/Btn';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MessageThread from '../../components/common/MessageThread';

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [feedbackText, setFeedbackText] = useState('');
  const [showRevisionInput, setShowRevisionInput] = useState(null); // draftId or null
  const [expandedDraft, setExpandedDraft] = useState(null);

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

  useEffect(() => {
    loadProject();
  }, [id]);

  // ─── Actions ───

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

  const handleRevision = async (draftId) => {
    if (!feedbackText.trim()) return;
    setActionLoading('revision');
    try {
      await requestRevision(id, draftId, feedbackText.trim());
      setFeedbackText('');
      setShowRevisionInput(null);
      await loadProject();
    } catch {
      setError('Could not request revision.');
    } finally {
      setActionLoading('');
    }
  };

  const handleComplete = async () => {
    setActionLoading('complete');
    try {
      const res = await completeProject(id);
      setProject(res.data.project);
    } catch {
      setError('Could not complete project.');
    } finally {
      setActionLoading('');
    }
  };

  // ─── Loading / Error states ───

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
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 font-body mb-4">{error}</p>
            <Btn onClick={() => navigate('/operator/dashboard')}>Back to Dashboard</Btn>
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  const brief = project.application?.brief;
  const transaction = project.transaction;
  const drafts = project.drafts || [];
  const latestDraft = drafts.length > 0 ? drafts[0] : null;

  // ─── Render ───

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Back button */}
        <button
          onClick={() => navigate('/operator/dashboard')}
          className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Dashboard
        </button>

        {/* ─── Project Header ─── */}
        <div className="card mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-full bg-accentLight flex items-center justify-center flex-shrink-0">
                <span className="text-base font-bold text-accent">
                  {project.creatorName?.charAt(0) || '?'}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="font-display text-xl font-bold text-dark truncate">
                  {brief?.title || 'Content Project'}
                </h1>
                <p className="text-sm text-muted font-body truncate">
                  {project.creatorName && `by ${project.creatorName}`}
                  {project.createdAt && ` \u00B7 Started ${formatDate(project.createdAt)}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <StatusBadge status={project.status} />
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─── Left Column: Brief Snapshot + Payment ─── */}
          <div className="lg:col-span-1 space-y-6">

            {/* Brief Snapshot */}
            <div className="card space-y-4">
              <h2 className="font-display text-lg font-semibold text-dark">Brief Snapshot</h2>

              {project.deliverables && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Deliverables</p>
                  <p className="text-sm text-dark font-body">{project.deliverables}</p>
                </div>
              )}

              {project.price != null && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Compensation</p>
                  <p className="text-xl font-bold text-dark font-body">
                    {formatCompensation(
                      project.compensationType,
                      project.compensationDetails,
                      project.price
                    )}
                  </p>
                </div>
              )}

              {project.usageRights && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Usage Rights</p>
                  <p className="text-sm text-dark font-body">{project.usageRights.replace(/_/g, ' ')}</p>
                </div>
              )}

              {project.contentDueAt && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Content Due</p>
                  <p className="text-sm text-dark font-body">{formatDate(project.contentDueAt)}</p>
                </div>
              )}

              {project.briefText && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Brief</p>
                  <p className="text-sm text-dark font-body leading-relaxed line-clamp-6">
                    {project.briefText}
                  </p>
                </div>
              )}

              {project.revisionsIncluded != null && (
                <div>
                  <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Revisions</p>
                  <p className="text-sm text-dark font-body">
                    {project.revisionsUsed || 0} / {project.revisionsIncluded} used
                  </p>
                </div>
              )}
            </div>

            {/* Escrow / Payment Status */}
            <div className="card space-y-3">
              <h2 className="font-display text-lg font-semibold text-dark">Payment</h2>

              {transaction ? (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted font-body uppercase tracking-wide">Transaction Status</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      transaction.status === 'RELEASED'
                        ? 'bg-greenBg text-green'
                        : transaction.status === 'ESCROW_HELD'
                          ? 'bg-yellowBg text-yellowText'
                          : 'bg-bgWarm text-muted'
                    }`}>
                      {transaction.status === 'ESCROW_HELD' ? 'Escrow Held' :
                       transaction.status === 'RELEASED' ? 'Released' :
                       transaction.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted font-body uppercase tracking-wide">Escrow</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      transaction.escrowStatus === 'RELEASED'
                        ? 'bg-greenBg text-green'
                        : transaction.escrowStatus === 'HELD'
                          ? 'bg-yellowBg text-yellowText'
                          : 'bg-bgWarm text-muted'
                    }`}>
                      {transaction.escrowStatus}
                    </span>
                  </div>
                  <div className="border-t border-border my-2" />
                  <div className="flex justify-between">
                    <span className="text-xs text-muted font-body uppercase tracking-wide">Total</span>
                    <span className="text-sm font-semibold text-dark font-body">
                      {formatCents(transaction.amount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted font-body uppercase tracking-wide">Creator Payout</span>
                    <span className="text-sm text-dark font-body">
                      {formatCents(transaction.creatorPayout || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted font-body uppercase tracking-wide">Platform Fee</span>
                    <span className="text-sm text-muted font-body">
                      {formatCents(transaction.platformFee || 0)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted font-body">
                  No transaction yet. Payment is created when the creator accepts.
                </p>
              )}
            </div>
          </div>

          {/* ─── Right Column: Drafts + Actions + Messages ─── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Complete & Release Payment button for APPROVED projects */}
            {project.status === 'APPROVED' && (
              <div className="card bg-greenBg/30 border-green/20">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-display text-base font-semibold text-dark mb-1">
                      Draft Approved
                    </h3>
                    <p className="text-sm text-muted font-body">
                      Content has been approved. Complete the project to release payment to the creator.
                    </p>
                  </div>
                  <Btn
                    onClick={handleComplete}
                    loading={actionLoading === 'complete'}
                    className="flex-shrink-0"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Complete &amp; Release Payment
                  </Btn>
                </div>
              </div>
            )}

            {/* Draft Submissions */}
            <div className="card">
              <h2 className="font-display text-lg font-semibold text-dark mb-4">
                Draft Submissions
                {drafts.length > 0 && (
                  <span className="text-sm font-normal text-muted ml-2">
                    ({drafts.length} draft{drafts.length !== 1 ? 's' : ''})
                  </span>
                )}
              </h2>

              {drafts.length === 0 ? (
                <div className="text-center py-8">
                  <svg className="w-10 h-10 text-muted/40 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                  </svg>
                  <p className="text-sm text-muted font-body">
                    No drafts submitted yet. The creator will upload content here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {drafts.map((draft) => {
                    const isExpanded = expandedDraft === draft.id;
                    const images = Array.isArray(draft.fileUrls) ? draft.fileUrls : [];
                    const isSubmitted = draft.status === 'SUBMITTED';
                    const isLatest = draft.id === latestDraft?.id;

                    return (
                      <div
                        key={draft.id}
                        className={`rounded-xl border p-4 transition-all ${
                          isLatest && isSubmitted
                            ? 'border-accent/30 bg-accentLight/20'
                            : 'border-border bg-bgWarm/50'
                        }`}
                      >
                        {/* Draft header */}
                        <button
                          type="button"
                          onClick={() => setExpandedDraft(isExpanded ? null : draft.id)}
                          className="w-full flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-dark font-body">
                              Version {draft.version}
                            </span>
                            <StatusBadge status={draft.status} />
                            {isLatest && (
                              <span className="text-[10px] uppercase tracking-wider text-accent font-semibold font-body">
                                Latest
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted font-body">
                              {draft.createdAt && formatDate(draft.createdAt)}
                            </span>
                            <svg
                              className={`w-4 h-4 text-muted transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                            </svg>
                          </div>
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                          <div className="mt-4 space-y-4">
                            {/* Image previews */}
                            {images.length > 0 && (
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {images.map((url, i) => (
                                  <div
                                    key={typeof url === 'string' ? url : i}
                                    className="aspect-square rounded-xl border border-border overflow-hidden bg-bgTan"
                                  >
                                    <img
                                      src={typeof url === 'string' ? url : url.url}
                                      alt={`Draft ${draft.version} - ${i + 1}`}
                                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Creator notes */}
                            {draft.notes && (
                              <div className="bg-white rounded-xl p-3 border border-border">
                                <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">
                                  Creator Notes
                                </p>
                                <p className="text-sm text-dark font-body leading-relaxed">
                                  {draft.notes}
                                </p>
                              </div>
                            )}

                            {/* Brand feedback (for reviewed drafts) */}
                            {draft.feedback && (
                              <div className="bg-orange-50 rounded-xl p-3 border border-orange-200">
                                <p className="text-xs text-orange-600 font-body uppercase tracking-wide mb-1">
                                  Your Feedback
                                </p>
                                <p className="text-sm text-orange-800 font-body leading-relaxed">
                                  {draft.feedback}
                                </p>
                              </div>
                            )}

                            {/* Action buttons for SUBMITTED drafts */}
                            {isSubmitted && (
                              <div className="space-y-3">
                                {showRevisionInput === draft.id ? (
                                  <div className="bg-white rounded-xl p-4 border border-border">
                                    <label className="block text-sm font-medium text-dark mb-1.5 font-body">
                                      Revision feedback
                                    </label>
                                    <textarea
                                      value={feedbackText}
                                      onChange={(e) => setFeedbackText(e.target.value)}
                                      rows={3}
                                      placeholder="Describe what you'd like changed..."
                                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none mb-3"
                                    />
                                    <div className="flex gap-2">
                                      <Btn
                                        size="sm"
                                        onClick={() => handleRevision(draft.id)}
                                        loading={actionLoading === 'revision'}
                                        disabled={!feedbackText.trim()}
                                      >
                                        Send Revision Request
                                      </Btn>
                                      <Btn
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => {
                                          setShowRevisionInput(null);
                                          setFeedbackText('');
                                        }}
                                      >
                                        Cancel
                                      </Btn>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col sm:flex-row gap-3">
                                    <Btn
                                      onClick={() => handleApprove(draft.id)}
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
                                      onClick={() => setShowRevisionInput(draft.id)}
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
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Messages */}
            <MessageThread projectId={id} />
          </div>
        </div>
      </div>
    </div>
  );
}
