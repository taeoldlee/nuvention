import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { creatorClient, uploadImages } from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import MessageThread from '../../components/common/MessageThread';
import { formatDate, formatCents, formatCompensation } from '../../utils/constants';
import {
  CheckCircle,
  XCircle,
  Upload,
  FileText,
  Clock,
  DollarSign,
  Image,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  PartyPopper,
  ArrowLeft,
  Send,
} from 'lucide-react';

const TOKEN_KEY = 'locale_creator_token';

function getStoredToken(projectId) {
  try {
    const stored = JSON.parse(localStorage.getItem(TOKEN_KEY) || '{}');
    return stored[projectId] || null;
  } catch { return null; }
}

function storeToken(projectId, token) {
  try {
    const stored = JSON.parse(localStorage.getItem(TOKEN_KEY) || '{}');
    stored[projectId] = token;
    localStorage.setItem(TOKEN_KEY, JSON.stringify(stored));
  } catch { /* ignore */ }
}

export default function CreatorProjectPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const urlToken = searchParams.get('token');
  const token = urlToken || getStoredToken(id);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  // Persist token
  useEffect(() => {
    if (urlToken && id) storeToken(id, urlToken);
  }, [urlToken, id]);

  const api = useMemo(() => (token ? creatorClient(token) : null), [token]);

  const fetchProject = useCallback(async () => {
    if (!api) return;
    try {
      const res = await api.getProject(id);
      setProject(res.data.project || res.data);
      setError('');
    } catch (err) {
      console.error('[CreatorProject] fetch error:', err.response?.status);
      if (err.response?.status === 401) {
        setError('This link is invalid or expired. Please check the link from your email.');
      } else {
        setError('Failed to load project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [api, id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleAccept = async () => {
    setActionLoading('accept');
    try {
      await api.accept(id);
      await fetchProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to accept project.');
    } finally {
      setActionLoading('');
    }
  };

  const handleDecline = async () => {
    if (!window.confirm('Are you sure you want to decline this project?')) return;
    setActionLoading('decline');
    try {
      await api.decline(id);
      await fetchProject();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to decline project.');
    } finally {
      setActionLoading('');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-bgWarm flex items-center justify-center px-4">
        <div className="card max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 text-muted mx-auto mb-4" />
          <h1 className="font-display text-xl font-semibold text-dark mb-2">Missing access token</h1>
          <p className="text-sm text-muted font-body">
            This page requires a valid project link. Check the invitation email you received from the brand.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted font-body">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="min-h-screen bg-bgWarm flex items-center justify-center px-4">
        <div className="card max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="font-display text-xl font-semibold text-dark mb-2">Something went wrong</h1>
          <p className="text-sm text-muted font-body mb-4">{error}</p>
          <button onClick={fetchProject} className="text-sm text-accent hover:underline font-body">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const brief = project.application?.brief;
  const drafts = project.drafts || [];
  const latestDraft = drafts.length > 0 ? drafts[0] : null;
  const status = project.status;

  const isInvitation = status === 'AWAITING_CREATOR_ACCEPTANCE';
  const isActive = ['IN_PROGRESS', 'DRAFT_SUBMITTED', 'REVISION_REQUESTED'].includes(status);
  const isDone = ['APPROVED', 'COMPLETED'].includes(status);

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <p className="text-xs text-accent font-semibold font-body uppercase tracking-wider mb-2">
            Creator Portal
          </p>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-dark">
                {brief?.title || 'Project'}
              </h1>
              <p className="text-sm text-muted font-body mt-1">
                with {project.brandProfile?.businessName || 'Brand'}
              </p>
            </div>
            <StatusBadge status={status} />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 font-body">
            {error}
          </div>
        )}

        {/* Invitation View */}
        {isInvitation && (
          <InvitationView
            project={project}
            brief={brief}
            onAccept={handleAccept}
            onDecline={handleDecline}
            actionLoading={actionLoading}
          />
        )}

        {/* Active Project View */}
        {isActive && (
          <ActiveView
            project={project}
            brief={brief}
            drafts={drafts}
            latestDraft={latestDraft}
            api={api}
            onRefresh={fetchProject}
          />
        )}

        {/* Completed View */}
        {isDone && (
          <CompletedView project={project} brief={brief} drafts={drafts} />
        )}

        {/* Messages — visible for active and completed projects */}
        {!isInvitation && (
          <div className="mt-6">
            <MessageThread
              projectId={id}
              senderRole="CREATOR"
              fetchFn={(pid, params) => api.getMessages(pid, params)}
              sendFn={(pid, text) => api.sendMessage(pid, text)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Invitation View
   ────────────────────────────────────────────── */
function InvitationView({ project, brief, onAccept, onDecline, actionLoading }) {
  return (
    <div className="space-y-6">
      {/* Invitation banner */}
      <div className="card p-6 border-l-4 border-accent">
        <h2 className="font-display text-lg font-semibold text-dark mb-2">
          You've been selected!
        </h2>
        <p className="text-sm text-mid font-body">
          Review the project details below and accept to get started, or decline if it's not a fit.
        </p>
      </div>

      {/* Brief snapshot */}
      <BriefSnapshot project={project} brief={brief} expanded />

      {/* Accept / Decline */}
      <div className="flex gap-3">
        <button
          onClick={onAccept}
          disabled={!!actionLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {actionLoading === 'accept' ? (
            <Spinner />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Accept Project
        </button>
        <button
          onClick={onDecline}
          disabled={!!actionLoading}
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border-2 border-border bg-white text-dark rounded-xl font-medium text-sm hover:bg-bgWarm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {actionLoading === 'decline' ? (
            <Spinner />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Decline
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Active View (IN_PROGRESS / DRAFT_SUBMITTED / REVISION_REQUESTED)
   ────────────────────────────────────────────── */
function ActiveView({ project, brief, drafts, latestDraft, api, onRefresh }) {
  const needsRevision = project.status === 'REVISION_REQUESTED';
  const waitingForReview = project.status === 'DRAFT_SUBMITTED';

  return (
    <div className="space-y-6">
      {/* Revision feedback banner */}
      {needsRevision && latestDraft?.feedback && (
        <div className="card p-5 border-l-4 border-orange-400 bg-orange-50/50">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-display text-sm font-semibold text-dark mb-1">Revision Requested</h3>
              <p className="text-sm text-mid font-body">{latestDraft.feedback}</p>
            </div>
          </div>
        </div>
      )}

      {/* Waiting indicator */}
      {waitingForReview && (
        <div className="card p-5 border-l-4 border-blue-400 bg-blue-50/50">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-display text-sm font-semibold text-dark mb-1">Under Review</h3>
              <p className="text-sm text-mid font-body">
                Your draft has been submitted. The brand is reviewing it now.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Brief snapshot (collapsed) */}
      <BriefSnapshot project={project} brief={brief} />

      {/* Draft upload */}
      {(project.status === 'IN_PROGRESS' || needsRevision) && (
        <DraftUpload
          projectId={project.id}
          api={api}
          onSuccess={onRefresh}
          revisionOf={needsRevision ? latestDraft?.version : null}
        />
      )}

      {/* Draft history */}
      {drafts.length > 0 && <DraftHistory drafts={drafts} />}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Completed View
   ────────────────────────────────────────────── */
function CompletedView({ project, brief, drafts }) {
  return (
    <div className="space-y-6">
      <div className="card p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-greenBg flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-7 h-7 text-green" />
        </div>
        <h2 className="font-display text-xl font-semibold text-dark mb-2">
          {project.status === 'COMPLETED' ? 'Project Complete!' : 'Draft Approved!'}
        </h2>
        <p className="text-sm text-mid font-body">
          {project.status === 'COMPLETED'
            ? 'Payment has been released. Great work!'
            : 'Your content has been approved by the brand.'}
        </p>
        {project.transaction && (
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-greenBg text-green text-sm font-semibold">
            <DollarSign className="w-4 h-4" />
            {formatCents(project.transaction.creatorPayout)} earned
          </div>
        )}
      </div>

      <BriefSnapshot project={project} brief={brief} />

      {drafts.length > 0 && <DraftHistory drafts={drafts} />}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Brief Snapshot (collapsible)
   ────────────────────────────────────────────── */
function BriefSnapshot({ project, brief, expanded: initialExpanded = false }) {
  const [expanded, setExpanded] = useState(initialExpanded);

  return (
    <div className="card">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-5"
      >
        <h3 className="font-display text-base font-semibold text-dark flex items-center gap-2">
          <FileText className="w-4 h-4 text-muted" />
          Project Details
        </h3>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted" />
        )}
      </button>

      {expanded && (
        <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <DetailItem label="Deliverables" value={project.deliverables} />
            <DetailItem
              label="Compensation"
              value={formatCompensation(project.compensationType, project.compensationDetails, project.price)}
            />
            <DetailItem
              label="Content Due"
              value={project.contentDueAt ? formatDate(project.contentDueAt) : 'No deadline'}
            />
            <DetailItem label="Usage Rights" value={formatUsageRights(project.usageRights)} />
            <DetailItem
              label="Revisions"
              value={`${project.revisionsUsed} / ${project.revisionsIncluded} used`}
            />
          </div>

          {brief?.creativeDirection && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Creative Direction</p>
              <p className="text-sm text-dark font-body bg-bgWarm rounded-xl p-3">{brief.creativeDirection}</p>
            </div>
          )}

          {brief?.dos && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Do's</p>
              <p className="text-sm text-green font-body bg-greenBg/50 rounded-xl p-3">{brief.dos}</p>
            </div>
          )}

          {brief?.donts && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Don'ts</p>
              <p className="text-sm text-red-600 font-body bg-red-50/50 rounded-xl p-3">{brief.donts}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Draft Upload
   ────────────────────────────────────────────── */
function DraftUpload({ projectId, api, onSuccess, revisionOf }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const previewsRef = useRef(previews);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length > 6) {
      setError('Maximum 6 images per draft.');
      return;
    }
    // Revoke old preview URLs before replacing
    previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    setFiles(selected);
    setError('');
    // Generate previews
    const urls = selected.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
  };

  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
    // Revoke old URL
    URL.revokeObjectURL(previews[index]);
  };

  // Keep ref in sync for cleanup
  useEffect(() => { previewsRef.current = previews; }, [previews]);

  // Cleanup preview URLs on unmount
  useEffect(() => {
    return () => previewsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) {
      setError('Please select at least one image.');
      return;
    }

    setUploading(true);
    setProgress(0);
    setError('');

    try {
      // Step 1: Upload files
      const formData = new FormData();
      files.forEach((f) => formData.append('images', f));

      const uploadRes = await uploadImages(formData, {
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 50));
        },
      });

      const fileUrls = uploadRes.data.images.map((img) => img.url);
      setProgress(60);

      // Step 2: Submit draft
      await api.submitDraft(projectId, {
        fileUrls,
        notes: notes.trim() || null,
      });

      setProgress(100);

      // Reset form
      setFiles([]);
      setPreviews([]);
      setNotes('');
      if (fileInputRef.current) fileInputRef.current.value = '';

      // Refresh project
      onSuccess();
    } catch (err) {
      console.error('[DraftUpload] error:', err.response?.data || err.message);
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="card p-5">
      <h3 className="font-display text-base font-semibold text-dark mb-4 flex items-center gap-2">
        <Upload className="w-4 h-4 text-muted" />
        {revisionOf ? `Submit Revision (v${revisionOf + 1})` : 'Submit Draft'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* File picker */}
        <div>
          <label className="text-sm font-semibold text-dark font-body mb-1.5 block">
            Images <span className="text-muted font-normal">(up to 6)</span>
          </label>

          {previews.length === 0 ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-2 text-muted hover:border-accent hover:text-accent transition-colors"
            >
              <Image className="w-8 h-8" />
              <span className="text-sm font-body">Click to select images</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {previews.map((url, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-bgWarm">
                    <img src={url} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="absolute top-1 right-1 w-6 h-6 bg-dark/70 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-sm text-accent hover:underline font-body"
              >
                Change images
              </button>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-semibold text-dark font-body mb-1.5 block">
            Notes <span className="text-muted font-normal">(optional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any context about this submission..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
          />
        </div>

        {error && <p className="text-xs text-red-500 font-body">{error}</p>}

        {/* Progress bar */}
        {uploading && (
          <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={files.length === 0 || uploading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent text-white rounded-xl font-medium text-sm hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? (
            <>
              <Spinner /> Uploading...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              {revisionOf ? 'Submit Revision' : 'Submit Draft'}
            </>
          )}
        </button>
      </form>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Draft History
   ────────────────────────────────────────────── */
function DraftHistory({ drafts }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="card p-5">
      <h3 className="font-display text-base font-semibold text-dark mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-muted" />
        Draft History
      </h3>

      <div className="space-y-3">
        {drafts.map((draft) => (
          <div key={draft.id} className="border border-border rounded-xl overflow-hidden">
            <button
              onClick={() => setExpandedId(expandedId === draft.id ? null : draft.id)}
              className="w-full flex items-center justify-between p-3 hover:bg-bgWarm/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-dark font-body">
                  Version {draft.version}
                </span>
                <StatusBadge status={draft.status} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted font-body">{formatDate(draft.createdAt)}</span>
                {expandedId === draft.id ? (
                  <ChevronUp className="w-4 h-4 text-muted" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-muted" />
                )}
              </div>
            </button>

            {expandedId === draft.id && (
              <div className="border-t border-border p-3 space-y-3">
                {/* Images */}
                {draft.fileUrls && (
                  <div className="grid grid-cols-3 gap-2">
                    {(Array.isArray(draft.fileUrls) ? draft.fileUrls : []).map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="aspect-square rounded-lg overflow-hidden bg-bgWarm block"
                      >
                        <img src={url} alt={`Draft v${draft.version} image ${i + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </a>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {draft.notes && (
                  <div>
                    <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Your Notes</p>
                    <p className="text-sm text-dark font-body">{draft.notes}</p>
                  </div>
                )}

                {/* Brand feedback */}
                {draft.feedback && (
                  <div className="bg-orange-50/50 rounded-xl p-3">
                    <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Brand Feedback</p>
                    <p className="text-sm text-orange-700 font-body">{draft.feedback}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────
   Helpers
   ────────────────────────────────────────────── */
function DetailItem({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-dark font-body font-medium">{value}</p>
    </div>
  );
}

function formatUsageRights(rights) {
  const labels = {
    ORGANIC_SOCIAL: 'Organic social',
    PAID_ADS: 'Paid ads',
    IN_STORE: 'In-store',
    WEBSITE: 'Website',
    ALL: 'All rights',
  };
  return labels[rights] || rights;
}

function Spinner() {
  return (
    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
