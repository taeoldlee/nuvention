import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, submitDraft, uploadImages } from '../../api';
import { formatCents, PROJECT_STATUS_LABELS } from '../../utils/constants';
import StatusBadge from '../../components/common/StatusBadge';
import ProjectStatusTracker from '../../components/common/ProjectStatusTracker';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Draft submission state
  const [draftFiles, setDraftFiles] = useState([]);
  const [draftPreviews, setDraftPreviews] = useState([]);
  const [draftNotes, setDraftNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    async function fetchProject() {
      setLoading(true);
      try {
        const res = await getProject(id);
        setProject(res.data.project);
      } catch {
        setError('Failed to load project.');
      } finally {
        setLoading(false);
      }
    }
    fetchProject();
  }, [id]);

  /* ── File handling ── */
  const handleFilesSelected = (files) => {
    const newFiles = Array.from(files).filter((f) =>
      f.type.startsWith('image/')
    );
    const combined = [...draftFiles, ...newFiles].slice(0, 10);
    setDraftFiles(combined);

    const newPreviews = combined.map((file) => URL.createObjectURL(file));
    draftPreviews.forEach((url) => URL.revokeObjectURL(url));
    setDraftPreviews(newPreviews);
  };

  const removeDraftFile = (index) => {
    URL.revokeObjectURL(draftPreviews[index]);
    setDraftFiles((prev) => prev.filter((_, i) => i !== index));
    setDraftPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files?.length) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  /* ── Submit draft ── */
  const handleSubmitDraft = async () => {
    if (draftFiles.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      // Upload images first
      const formData = new FormData();
      draftFiles.forEach((file) => formData.append('images', file));
      const uploadRes = await uploadImages(formData);
      const fileUrls = (uploadRes.data.images || []).map((img) => img.url);

      // Submit draft with URLs
      await submitDraft(id, {
        fileUrls,
        notes: draftNotes.trim() || undefined,
      });
      setSubmitSuccess(true);
      // Refresh project
      const res = await getProject(id);
      setProject(res.data.project);
      // Clear form
      setDraftFiles([]);
      draftPreviews.forEach((url) => URL.revokeObjectURL(url));
      setDraftPreviews([]);
      setDraftNotes('');
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to submit draft. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading project..." creator />;
  }

  if (error && !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 mx-auto mb-4 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-dark mb-2">
          {error}
        </h2>
        <Btn
          creator
          variant="secondary"
          onClick={() => navigate('/creator/dashboard')}
        >
          Back to Dashboard
        </Btn>
      </div>
    );
  }

  // Project data extraction
  const brandName =
    project.brandProfile?.user?.name ||
    project.brandProfile?.businessName ||
    project.brand?.name || project.brandName || 'Brand';
  const brandPhoto =
    project.brandProfile?.user?.avatarUrl ||
    project.brandProfile?.profilePhotoUrl ||
    project.brand?.profilePhoto || project.brand?.photo || null;
  const contentType =
    project.match?.contentRequest?.contentType ||
    project.contentType || project.request?.contentType || 'Content Project';
  const status = project.status || 'BRIEF_SENT';
  const pay = project.price ?? project.pay ?? project.budget ?? 0;
  const deliverables =
    project.deliverables || project.match?.deliverables || project.request?.deliverables || [];
  const timeline =
    project.timeline || project.match?.timeline || project.request?.timeline || '';
  const usageRights =
    project.usageRights ||
    project.match?.usageRights ||
    project.request?.usageRights ||
    '100% usage rights included';
  const briefText =
    project.briefText ||
    project.match?.contentRequest?.description ||
    project.request?.description ||
    project.request?.briefText ||
    '';
  const drafts = project.drafts || [];
  const latestDraft = drafts.length > 0 ? drafts[0] : null;
  const revisionNotes =
    project.revisionNotes ||
    project.revisionFeedback ||
    latestDraft?.revisionFeedback ||
    latestDraft?.feedback ||
    '';

  const canSubmitDraft =
    status === 'BRIEF_SENT' || status === 'REVISION_REQUESTED';
  const isDraftSubmitted = status === 'DRAFT_SUBMITTED';
  const isRevisionRequested = status === 'REVISION_REQUESTED';
  const isApproved = status === 'APPROVED';
  const isDelivered = status === 'DELIVERED';

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back link */}
      <button
        onClick={() => navigate('/creator/dashboard')}
        className="flex items-center gap-1.5 text-muted hover:text-dark font-body text-sm font-medium mb-6 transition-colors duration-200"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
          />
        </svg>
        Back to Dashboard
      </button>

      {/* Project header card */}
      <div className="card mb-6">
        <div className="flex items-start gap-4 mb-5">
          {/* Brand avatar */}
          {brandPhoto ? (
            <img
              src={brandPhoto}
              alt={brandName}
              className="w-14 h-14 rounded-xl object-cover shrink-0"
            />
          ) : (
            <div className="w-14 h-14 rounded-xl bg-creatorLight flex items-center justify-center shrink-0">
              <span className="font-display text-xl font-bold text-creator">
                {brandName.charAt(0)}
              </span>
            </div>
          )}

          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-dark mb-0.5 truncate">
              {brandName}
            </h1>
            <p className="font-body text-muted text-sm">{contentType}</p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* Pay — prominent */}
        <div className="text-center py-5 bg-creatorLight/30 rounded-xl mb-5">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
            Your Pay
          </p>
          <p className="font-display text-4xl font-bold text-dark">
            {formatCents(pay)}
          </p>
        </div>

        {/* Status tracker */}
        <ProjectStatusTracker status={status} creator />
      </div>

      {/* Project details */}
      <div className="card mb-6">
        <h2 className="font-display text-lg font-bold text-dark mb-4">
          Project Details
        </h2>

        {/* Brief text */}
        {briefText && (
          <div className="mb-5">
            <h3 className="label">Brief</h3>
            <p className="font-body text-sm text-mid leading-relaxed">
              {briefText}
            </p>
          </div>
        )}

        {/* Deliverables */}
        {deliverables && (
          <div className="mb-5">
            <h3 className="label">Deliverables</h3>
            {Array.isArray(deliverables) ? (
              <ul className="space-y-2">
                {deliverables.map((d, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-2 font-body text-sm text-dark"
                  >
                    <svg
                      className="w-4 h-4 text-creatorAccent shrink-0"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {typeof d === 'string'
                      ? d
                      : d.description || d.name || JSON.stringify(d)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-body text-sm text-dark">{deliverables}</p>
            )}
          </div>
        )}

        {/* Timeline & Usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {timeline && (
            <div className="bg-bgWarm rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Timeline
              </p>
              <p className="font-body text-sm font-medium text-dark">
                {timeline}
              </p>
            </div>
          )}
          <div className="bg-bgWarm rounded-xl p-4">
            <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
              Usage Rights
            </p>
            <p className="font-body text-sm font-medium text-dark">
              {usageRights}
            </p>
          </div>
        </div>
      </div>

      {/* Revision notes (when revision requested) */}
      {isRevisionRequested && revisionNotes && (
        <div className="card mb-6 border-orange-200 bg-orange-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-body font-semibold text-orange-800 mb-1">
                Revision Requested
              </h3>
              <p className="font-body text-sm text-orange-700 leading-relaxed">
                {revisionNotes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Draft submission area */}
      {canSubmitDraft && (
        <div className="card mb-6">
          <h2 className="font-display text-lg font-bold text-dark mb-4">
            {isRevisionRequested ? 'Submit Revision' : 'Submit Your Draft'}
          </h2>
          <p className="font-body text-sm text-muted mb-5">
            {isRevisionRequested
              ? 'Upload your revised content based on the feedback above.'
              : 'Upload your content and add any notes for the brand.'}
          </p>

          {/* Upload zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="border-2 border-dashed border-creator/30 rounded-2xl p-8 text-center cursor-pointer hover:border-creator/60 hover:bg-creatorLight/30 transition-all duration-200 mb-5"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-xl bg-creatorLight mx-auto mb-3 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-creator"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            </div>
            <p className="font-body font-semibold text-dark mb-1">
              Drag images here or click to browse
            </p>
            <p className="font-body text-sm text-muted">
              JPG, PNG, or WebP
            </p>
          </div>

          {/* Draft previews */}
          {draftPreviews.length > 0 && (
            <div className="mb-5">
              <p className="text-sm font-semibold text-mid mb-3">
                {draftPreviews.length} image{draftPreviews.length !== 1 ? 's' : ''} selected
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {draftPreviews.map((src, i) => (
                  <div
                    key={i}
                    className="relative aspect-square rounded-xl overflow-hidden group"
                  >
                    <img
                      src={src}
                      alt={`Draft ${i + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDraftFile(i);
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-black/70"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="mb-5">
            <label className="label">Notes (optional)</label>
            <textarea
              value={draftNotes}
              onChange={(e) => setDraftNotes(e.target.value)}
              placeholder="Any context for the brand about your creative choices..."
              rows={3}
              className="input input-creator resize-none"
            />
          </div>

          {/* Submit success banner */}
          {submitSuccess && (
            <div className="bg-greenBg border border-green/20 rounded-xl p-4 mb-5">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-green"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-sm font-medium text-green">
                  Draft submitted successfully!
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <p className="text-sm text-red-700 font-body">{error}</p>
            </div>
          )}

          <Btn
            creator
            size="lg"
            className="w-full"
            onClick={handleSubmitDraft}
            loading={submitting}
            disabled={draftFiles.length === 0}
          >
            {isRevisionRequested ? 'Submit Revision' : 'Submit Draft'}
          </Btn>
        </div>
      )}

      {/* Submitted draft view */}
      {isDraftSubmitted && latestDraft && (
        <div className="card mb-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <svg
                className="w-5 h-5 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-dark">
                Draft Submitted
              </h2>
              <p className="font-body text-sm text-muted">
                Waiting for review from the brand.
              </p>
            </div>
          </div>

          {/* Submitted images */}
          {(latestDraft.fileUrls || latestDraft.images)?.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-4">
              {(latestDraft.fileUrls || latestDraft.images).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={typeof img === 'string' ? img : img.url}
                    alt={`Submitted ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Creator's notes */}
          {latestDraft.notes && (
            <div className="bg-bgWarm rounded-xl p-4">
              <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                Your Notes
              </p>
              <p className="font-body text-sm text-mid leading-relaxed">
                {latestDraft.notes}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Approved state */}
      {(isApproved || isDelivered) && (
        <div className="card mb-6 text-center py-8">
          <div className="w-16 h-16 rounded-full bg-greenBg mx-auto mb-4 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-green"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z"
              />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-bold text-dark mb-2">
            {isDelivered ? 'Content Delivered' : 'Content Approved'}
          </h2>
          <p className="font-body text-muted max-w-sm mx-auto mb-6">
            {isDelivered
              ? 'This project is complete. Great work!'
              : 'The brand loved your content. Payment will be processed shortly.'}
          </p>

          {/* Show approved content */}
          {(latestDraft?.fileUrls || latestDraft?.images)?.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-w-lg mx-auto">
              {(latestDraft.fileUrls || latestDraft.images).map((img, i) => (
                <div
                  key={i}
                  className="aspect-square rounded-xl overflow-hidden"
                >
                  <img
                    src={typeof img === 'string' ? img : img.url}
                    alt={`Approved ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
