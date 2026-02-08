import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject, submitDraft, uploadImages } from '../../api';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProjectHeader from '../../components/creator/ProjectHeader';
import ProjectDetailsCard from '../../components/creator/ProjectDetailsCard';
import DraftUploadSection from '../../components/creator/DraftUploadSection';
import { DraftSubmittedView, ApprovedView } from '../../components/creator/DraftStatusView';

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();

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
    const newFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
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

  /* ── Submit draft ── */
  const handleSubmitDraft = async () => {
    if (draftFiles.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      draftFiles.forEach((file) => formData.append('images', file));
      const uploadRes = await uploadImages(formData);
      const fileUrls = (uploadRes.data.images || []).map((img) => img.url);
      await submitDraft(id, { fileUrls, notes: draftNotes.trim() || undefined });
      setSubmitSuccess(true);
      const res = await getProject(id);
      setProject(res.data.project);
      setDraftFiles([]);
      draftPreviews.forEach((url) => URL.revokeObjectURL(url));
      setDraftPreviews([]);
      setDraftNotes('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit draft. Please try again.');
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
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-dark mb-2">{error}</h2>
        <Btn creator variant="secondary" onClick={() => navigate('/creator/dashboard')}>
          Back to Dashboard
        </Btn>
      </div>
    );
  }

  // Derive display fields
  const brandName = project.brandProfile?.user?.name || project.brandProfile?.businessName || project.brand?.name || project.brandName || 'Brand';
  const brandPhoto = project.brandProfile?.user?.avatarUrl || project.brandProfile?.profilePhotoUrl || project.brand?.profilePhoto || project.brand?.photo || null;
  const contentType = project.match?.contentRequest?.contentType || project.contentType || project.request?.contentType || 'Content Project';
  const status = project.status || 'BRIEF_SENT';
  const pay = project.price ?? project.pay ?? project.budget ?? 0;
  const compensationType = project.compensationType || project.request?.compensationType || 'FLAT_FEE';
  const compensationDetails = project.compensationDetails || project.request?.compensationDetails || null;
  const deliverables = project.deliverables || project.match?.deliverables || project.request?.deliverables || [];
  const timeline = project.timeline || project.match?.timeline || project.request?.timeline || '';
  const usageRights = project.usageRights || project.match?.usageRights || project.request?.usageRights || '100% usage rights included';
  const briefText = project.briefText || project.match?.contentRequest?.description || project.request?.description || project.request?.briefText || '';
  const drafts = project.drafts || [];
  const latestDraft = drafts.length > 0 ? drafts[0] : null;
  const revisionNotes = project.revisionNotes || project.revisionFeedback || latestDraft?.revisionFeedback || latestDraft?.feedback || '';

  const canSubmitDraft = status === 'BRIEF_SENT' || status === 'REVISION_REQUESTED';
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
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Dashboard
      </button>

      <ProjectHeader
        brandName={brandName}
        brandPhoto={brandPhoto}
        contentType={contentType}
        status={status}
        compensationType={compensationType}
        compensationDetails={compensationDetails}
        pay={pay}
      />

      <ProjectDetailsCard
        briefText={briefText}
        deliverables={deliverables}
        timeline={timeline}
        usageRights={usageRights}
      />

      {/* Revision notes banner */}
      {isRevisionRequested && revisionNotes && (
        <div className="card mb-6 border-orange-200 bg-orange-50/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </div>
            <div>
              <h3 className="font-body font-semibold text-orange-800 mb-1">Revision Requested</h3>
              <p className="font-body text-sm text-orange-700 leading-relaxed">{revisionNotes}</p>
            </div>
          </div>
        </div>
      )}

      {canSubmitDraft && (
        <DraftUploadSection
          isRevisionRequested={isRevisionRequested}
          draftFiles={draftFiles}
          draftPreviews={draftPreviews}
          draftNotes={draftNotes}
          setDraftNotes={setDraftNotes}
          submitting={submitting}
          submitSuccess={submitSuccess}
          error={error}
          onFilesSelected={handleFilesSelected}
          onRemoveFile={removeDraftFile}
          onSubmit={handleSubmitDraft}
        />
      )}

      {status === 'DRAFT_SUBMITTED' && latestDraft && (
        <DraftSubmittedView latestDraft={latestDraft} />
      )}

      {(isApproved || isDelivered) && (
        <ApprovedView isDelivered={isDelivered} latestDraft={latestDraft} navigate={navigate} />
      )}
    </div>
  );
}
