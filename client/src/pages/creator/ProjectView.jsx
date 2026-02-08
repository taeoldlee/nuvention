import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProject } from '../../api';
import { brandDisplayName, brandPhotoUrl } from '../../utils/extractors';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ProjectHeader from '../../components/creator/ProjectHeader';
import ProjectDetailsCard from '../../components/creator/ProjectDetailsCard';
import DraftUploadSection from '../../components/creator/DraftUploadSection';
import { DraftSubmittedView, ApprovedView } from '../../components/creator/DraftStatusView';
import useDraftSubmission from '../../hooks/useDraftSubmission';

export default function ProjectView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProject = async () => {
    const res = await getProject(id);
    setProject(res.data.project);
  };

  const draftActions = useDraftSubmission(id, loadProject);

  useEffect(() => {
    setLoading(true);
    loadProject()
      .catch(() => setError('Failed to load project.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner message="Loading project..." creator />;

  if (error && !project) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 mx-auto mb-4 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <h2 className="font-display text-xl font-bold text-dark mb-2">{error}</h2>
        <Btn creator variant="secondary" onClick={() => navigate('/creator/dashboard')}>Back to Dashboard</Btn>
      </div>
    );
  }

  const status = project.status || 'BRIEF_SENT';
  const contentType = project.match?.contentRequest?.contentType || project.contentType || project.request?.contentType || 'Content Project';
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

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/creator/dashboard')} className="flex items-center gap-1.5 text-muted hover:text-dark font-body text-sm font-medium mb-6 transition-colors duration-200">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Dashboard
      </button>

      <ProjectHeader brandName={brandDisplayName(project)} brandPhoto={brandPhotoUrl(project)} contentType={contentType} status={status} compensationType={compensationType} compensationDetails={compensationDetails} pay={project.price ?? project.pay ?? project.budget ?? 0} />

      <ProjectDetailsCard briefText={briefText} deliverables={deliverables} timeline={timeline} usageRights={usageRights} />

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

      {canSubmitDraft && <DraftUploadSection draftActions={draftActions} isRevisionRequested={isRevisionRequested} />}

      {status === 'DRAFT_SUBMITTED' && latestDraft && <DraftSubmittedView latestDraft={latestDraft} />}

      {(status === 'APPROVED' || status === 'DELIVERED') && <ApprovedView isDelivered={status === 'DELIVERED'} latestDraft={latestDraft} navigate={navigate} />}
    </div>
  );
}
