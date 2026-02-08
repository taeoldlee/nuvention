import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBriefs, acceptBrief, declineBrief } from '../../api';
import { formatCents } from '../../utils/constants';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MatchSignals from '../../components/common/MatchSignals';

function formatCompensation(type, details, pay) {
  if (type === 'FREE_PRODUCT') return details?.note ? `Free product: ${details.note}` : 'Free product/meal';
  if (type === 'DISCOUNT_CODE') return details?.note ? `Discount: ${details.note}` : 'Discount code';
  if (type === 'HYBRID') {
    const cash = details?.minCents ? `$${(details.minCents / 100).toFixed(0)}+` : '$';
    const note = details?.note ? details.note : 'product/benefit';
    return `${cash} ${note}`;
  }
  if (pay != null) return formatCents(pay);
  return 'Flat fee';
}
export default function BriefDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [acceptedData, setAcceptedData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBrief() {
      setLoading(true);
      try {
        const res = await getBriefs();
        const allBriefs = res.data?.briefs || [];
        const found = allBriefs.find(
          (b) => (b.matchId || b.id || b._id) === matchId
        );
        if (found) {
          setBrief(found);
        } else {
          setError('Brief not found.');
        }
      } catch {
        setError('Failed to load brief details.');
      } finally {
        setLoading(false);
      }
    }
    fetchBrief();
  }, [matchId]);

  const handleAccept = async () => {
    setAccepting(true);
    setError(null);
    try {
      const res = await acceptBrief(matchId);
      setAcceptedData(res.data);
      setAccepted(true);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Failed to accept brief. Please try again.'
      );
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = async () => {
    setDeclining(true);
    setError(null);
    try {
      await declineBrief(matchId);
      navigate('/creator/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Failed to decline brief. Please try again.'
      );
      setDeclining(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading brief..." creator />;
  }

  if (error && !brief) {
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
        <Btn creator variant="secondary" onClick={() => navigate('/creator/dashboard')}>
          Back to Dashboard
        </Btn>
      </div>
    );
  }

  // Accepted celebration screen
  if (accepted) {
    const brandName =
      brief?.brand?.businessName ||
      brief?.brand?.user?.name ||
      acceptedData?.brand?.name ||
      acceptedData?.brandName ||
      brief?.brand?.name ||
      'the brand';
    const projectId =
      acceptedData?.project?.id || acceptedData?.projectId || brief?.projectId;

    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-creatorLight mx-auto mb-6 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-creatorAccent"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="font-display text-3xl font-bold text-dark mb-3">
          Brief Accepted
        </h2>
        <p className="font-body text-muted mb-2 max-w-md mx-auto">
          You're now working with <span className="font-semibold text-dark">{brandName}</span>.
        </p>
        <p className="font-body text-sm text-muted mb-8 max-w-md mx-auto">
          Head to your project page to see the full details and submit your work.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Btn
            creator
            size="lg"
            onClick={() =>
              navigate(
                projectId
                  ? `/creator/project/${projectId}`
                  : '/creator/dashboard'
              )
            }
          >
            {projectId ? 'Go to Project' : 'Go to Dashboard'}
          </Btn>
        </div>
      </div>
    );
  }

  // Brief data extraction
  const contentType =
    brief.contentRequest?.contentType ||
    brief.contentType || brief.request?.contentType || 'Content Project';
  const styleDirection =
    brief.style ||
    brief.styleDirection ||
    brief.request?.styleDirection ||
    brief.request?.vibe ||
    '';
  const deliverables =
    brief.deliverables || brief.request?.deliverables || [];
  const pay = brief.price ?? brief.pay ?? brief.request?.budget ?? brief.budget ?? 0;
  const compensationType = brief.compensationType || brief.request?.compensationType || 'FLAT_FEE';
  const compensationDetails = brief.compensationDetails || brief.request?.compensationDetails || null;
  const timeline = brief.timeline || brief.request?.timeline || '';
  const usageRights =
    brief.usageRights || brief.request?.usageRights || '100% usage rights included';
  const matchRationale =
    brief.matchRationale ||
    brief.rationale ||
    'Matched based on your style, neighborhood, and portfolio.';
  const matchSignals = brief.matchSignals || null;

  // Brand identity hidden -- show vibe clues
  const neighborhood =
    brief.brand?.neighborhood ||
    brief.neighborhood ||
    brief.request?.neighborhood ||
    '';
  const brandVibe =
    brief.brand?.vibe?.[0] ||
    brief.brandVibe ||
    brief.request?.vibe ||
    '';
  const brandValues =
    brief.brandValues ||
    brief.brand?.values?.[0] ||
    '';
  const identityHints = [neighborhood, brandVibe, brandValues]
    .filter(Boolean)
    .join(' \u00B7 ');

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

      {/* Brief card */}
      <div className="card mb-6">
        {/* Content type heading */}
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-dark mb-1">
            {contentType}
          </h1>
          {styleDirection && (
            <p className="font-body text-muted">
              Style: {styleDirection}
            </p>
          )}
        </div>

        {/* Brand identity hints (hidden brand name) */}
        {identityHints && (
          <div className="flex items-center gap-2 mb-6 px-4 py-3 rounded-xl bg-bgWarm">
            <svg
              className="w-5 h-5 text-creatorAccent shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0V5.25A2.25 2.25 0 015.25 3h13.5A2.25 2.25 0 0121 5.25v4.1"
              />
            </svg>
            <p className="font-body text-sm font-medium text-mid">
              {identityHints}
            </p>
          </div>
        )}

        {/* Deliverables */}
        {deliverables && (
          <div className="mb-6">
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
                    {typeof d === 'string' ? d : d.description || d.name || JSON.stringify(d)}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="font-body text-sm text-dark">{deliverables}</p>
            )}
          </div>
        )}

        {/* Timeline & Usage Rights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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

        {/* Compensation */}
        <div className="text-center py-6 border-y border-border mb-6">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">
            Compensation
          </p>
          <p className="font-display text-4xl font-bold text-dark">
            {formatCompensation(compensationType, compensationDetails, pay)}
          </p>
        </div>

        {/* Why you were selected */}
        <div className="bg-creatorLight/50 rounded-xl p-5">
          <p className="font-body text-sm font-semibold text-dark mb-2">
            Why you were selected
          </p>
          <p className="font-body text-sm text-muted leading-relaxed mb-4">
            {matchRationale}
          </p>
          <MatchSignals signals={matchSignals} />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-red-700 font-body">{error}</p>
        </div>
      )}

      {/* CTAs */}
      <div className="flex items-center justify-between gap-4">
        <Btn
          variant="ghost"
          onClick={handleDecline}
          loading={declining}
          disabled={accepting}
        >
          Decline
        </Btn>
        <Btn
          creator
          size="lg"
          onClick={handleAccept}
          loading={accepting}
          disabled={declining}
        >
          Accept Brief
        </Btn>
      </div>
    </div>
  );
}
