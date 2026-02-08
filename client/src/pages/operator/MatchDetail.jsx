import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getContentRequests, selectMatch } from '../../api';
import { formatCompensation } from '../../utils/constants';
import Btn from '../../components/common/Btn';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import MatchSignals from '../../components/common/MatchSignals';

export default function MatchDetail() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Try to get data from navigation state first
  const stateRequestId = location.state?.requestId;
  const stateMatch = location.state?.match;

  const [match, setMatch] = useState(stateMatch || null);
  const [requestId, setRequestId] = useState(stateRequestId || null);
  const [loading, setLoading] = useState(!stateMatch);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState(null);
  const redirectTimer = useRef(null);

  // Clean up redirect timer on unmount
  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  // Load match from requests if not in state
  useEffect(() => {
    if (stateMatch && stateRequestId) return;

    async function loadMatch() {
      setLoading(true);
      try {
        const res = await getContentRequests();
        const requests = res.data.requests || [];
        let foundMatch = null;
        let foundRequestId = null;

        for (const req of requests) {
          const m = req.matches?.find((m) => m.id === matchId);
          if (m) {
            foundMatch = m;
            foundRequestId = req.id;
            break;
          }
        }

        if (foundMatch) {
          setMatch(foundMatch);
          setRequestId(foundRequestId);
        } else {
          setError('Match not found.');
        }
      } catch (err) {
        setError('Could not load match details.');
      } finally {
        setLoading(false);
      }
    }
    loadMatch();
  }, [matchId, stateMatch, stateRequestId]);

  const handleConfirm = async () => {
    if (!requestId || !matchId) return;
    setConfirming(true);
    try {
      const res = await selectMatch(requestId, matchId);
      const project = res.data.project;
      // Extract creator info from the project's nested data
      const creator = project?.match?.creatorProfile?.user || project?.creatorProfile?.user || null;
      if (creator?.name) {
        const parts = creator.name.trim().split(' ');
        const first = parts[0];
        const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]}.` : '';
        setCreatorInfo({
          displayName: [first, lastInitial].filter(Boolean).join(' '),
          fullName: creator.name,
          photoUrl: creator.avatarUrl,
        });
      } else {
        setCreatorInfo(null);
      }
      setConfirming(false);
      setConfirmed(true);

      // Redirect to project after a short reveal
      redirectTimer.current = setTimeout(() => {
        if (project?.id) {
          navigate(`/operator/project/${project.id}`);
        } else {
          navigate('/operator/dashboard');
        }
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Could not confirm. Please try again.'
      );
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <LoadingSpinner message="Loading match details..." />
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 font-body mb-4">{error}</p>
            <Btn onClick={() => navigate(-1)}>Go Back</Btn>
          </div>
        </div>
      </div>
    );
  }

  // ─── Confirmed / Creator Reveal ───
  if (confirmed) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <div className="w-16 h-16 rounded-full bg-greenBg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-dark mb-2">
              You're all set!
            </h2>
            <p className="font-body text-muted mb-6">
              Your project is live. Here's who you'll be working with:
            </p>

            {creatorInfo && (
              <div className="inline-flex flex-col items-center bg-bgWarm rounded-2xl p-6 mb-4">
                {creatorInfo.photoUrl ? (
                  <img
                    src={creatorInfo.photoUrl}
                    alt={creatorInfo.displayName}
                    className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-accentLight flex items-center justify-center mb-3">
                    <span className="text-2xl font-bold text-accent">
                      {creatorInfo.displayName?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <p className="font-display text-lg font-semibold text-dark">
                  {creatorInfo.displayName}
                </p>
                <p className="text-xs text-muted font-body">
                  Full profile available in your project
                </p>
              </div>
            )}

            <p className="text-xs text-muted font-body">
              Redirecting to your project...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Match Detail View ───
  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to options
        </button>

        <div className="card">
          {/* Header */}
          <div className="flex items-start gap-5 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accentLight text-accent">
                  {match.creatorAlias || 'Creator'}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bgTan text-mid">
                  {match.contentType || 'Content'}
                </span>
                {match.style && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bgTan text-mid">
                    {match.style}
                  </span>
                )}
              </div>
              <h1 className="font-display text-2xl font-bold text-dark">
                Match Details
              </h1>
            </div>
          </div>

          {/* Content Samples */}
          {match.portfolioSamples?.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {match.portfolioSamples.slice(0, 3).map((item, i) => (
                <div
                  key={item.id || i}
                  className="aspect-square rounded-xl border border-border overflow-hidden bg-bgTan"
                >
                  <img
                    src={item.imageUrl}
                    alt={`Sample ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          {(match.contentPreview || match.description) && (
            <p className="text-dark font-body leading-relaxed mb-6">
              {match.contentPreview || match.description}
            </p>
          )}

          {/* Evidence Signals */}
          <MatchSignals signals={match.matchSignals} />

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            {/* Deliverables */}
            {match.deliverables && (
              <div className="bg-bgWarm rounded-xl p-4">
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">
                  Deliverables
                </p>
                {Array.isArray(match.deliverables) ? (
                  <ul className="space-y-1">
                    {match.deliverables.map((d, i) => (
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
                  <p className="text-sm text-dark font-body">{match.deliverables}</p>
                )}
              </div>
            )}

            {/* Compensation */}
            <div className="bg-bgWarm rounded-xl p-4">
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">
                Compensation
              </p>
              <p className="text-2xl font-bold text-dark font-body">
                {formatCompensation(match.compensationType, match.compensationDetails, match.price)}
              </p>
            </div>

            {/* Timeline */}
            {match.timeline && (
              <div className="bg-bgWarm rounded-xl p-4">
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">
                  Timeline
                </p>
                <p className="text-sm text-dark font-body font-medium">
                  {match.timeline}
                </p>
              </div>
            )}

            {/* Usage Rights */}
            {match.usageRights && (
              <div className="bg-bgWarm rounded-xl p-4">
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">
                  Usage Rights
                </p>
                <p className="text-sm text-dark font-body font-medium">
                  {match.usageRights}
                </p>
              </div>
            )}
          </div>

          {/* Match Rationale */}
          {(match.matchRationale || match.rationale) && (
            <div className="bg-accentLight border border-accent/20 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-2">
                <svg className="w-4 h-4 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-semibold text-accent font-body">
                  Why this match
                </p>
              </div>
              <p className="text-sm text-mid font-body leading-relaxed">
                {match.matchRationale || match.rationale}
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600 font-body mb-4">{error}</p>
          )}

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border">
            <Btn
              onClick={handleConfirm}
              loading={confirming}
              className="flex-1"
              size="lg"
            >
              Confirm & Commission
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => navigate(-1)}
              className="flex-1"
              size="lg"
            >
              Back to Options
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
