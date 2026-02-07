import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContentRequest } from '../../api';
import { CONTENT_TYPES, formatCents } from '../../utils/constants';
import Btn from '../../components/common/Btn';
import Chip from '../../components/common/Chip';
import MatchScoreBadge from '../../components/common/MatchScoreBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function NewRequest() {
  const navigate = useNavigate();

  const [contentType, setContentType] = useState('');
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matches, setMatches] = useState(null);
  const [requestId, setRequestId] = useState(null);

  const handleFindMatches = async () => {
    if (!contentType) return;
    setLoading(true);
    setError('');
    try {
      // Intentional brief delay for UX polish
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const res = await createContentRequest({ contentType, brief });
      const request = res.data.request;
      setRequestId(request.id);
      setMatches(request.matches || []);
    } catch (err) {
      setError(
        err.response?.data?.error || 'Could not find matches. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Loading State ───
  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="card text-center py-20">
            <LoadingSpinner message="Finding your best matches..." />
            <p className="text-sm text-muted font-body mt-4">
              We're analyzing creator portfolios and availability...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ─── Match Results ───
  if (matches) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => {
                setMatches(null);
                setRequestId(null);
              }}
              className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body mb-4 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              New request
            </button>
            <h1 className="font-display text-3xl font-bold text-dark mb-2">
              Your matches
            </h1>
            <p className="font-body text-muted">
              We found {matches.length} creator{matches.length !== 1 ? 's' : ''} who
              fit your {contentType.toLowerCase()} brief.
            </p>
          </div>

          {/* No matches fallback */}
          {matches.length === 0 && (
            <div className="card text-center py-12">
              <div className="w-14 h-14 rounded-2xl bg-bgWarm mx-auto mb-4 flex items-center justify-center text-muted">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>
              <h3 className="font-display text-lg font-semibold text-dark mb-2">
                No matches found
              </h3>
              <p className="text-sm text-muted font-body mb-6">
                Try adjusting your content type or brief for better results.
              </p>
              <Btn onClick={() => { setMatches(null); setRequestId(null); }}>
                Try Again
              </Btn>
            </div>
          )}

          {/* Match Cards */}
          <div className="space-y-4">
            {matches.map((match, idx) => (
              <div
                key={match.id || idx}
                className="card hover:shadow-md hover:border-accent/20 transition-all duration-200"
              >
                <div className="flex items-start gap-5">
                  {/* Score Badge */}
                  <div className="flex-shrink-0 pt-1">
                    <MatchScoreBadge score={match.matchScore || match.score || 85} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accentLight text-accent">
                        {contentType}
                      </span>
                      {match.style && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-bgTan text-mid">
                          {match.style}
                        </span>
                      )}
                    </div>

                    {(match.contentPreview || match.description) && (
                      <p className="text-sm text-dark font-body mb-3 leading-relaxed">
                        {match.contentPreview || match.description}
                      </p>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      {match.deliverables && (
                        <div>
                          <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
                            Deliverables
                          </p>
                          <p className="text-sm text-dark font-body font-medium">
                            {Array.isArray(match.deliverables)
                              ? match.deliverables.join(', ')
                              : match.deliverables}
                          </p>
                        </div>
                      )}
                      {match.price != null && (
                        <div>
                          <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
                            Price
                          </p>
                          <p className="text-lg text-dark font-body font-bold">
                            {formatCents(match.price)}
                          </p>
                        </div>
                      )}
                      {match.timeline && (
                        <div>
                          <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
                            Timeline
                          </p>
                          <p className="text-sm text-dark font-body font-medium">
                            {match.timeline}
                          </p>
                        </div>
                      )}
                      {match.usageRights && (
                        <div>
                          <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">
                            Usage
                          </p>
                          <p className="text-sm text-dark font-body font-medium">
                            {match.usageRights}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* CTA */}
                    <Btn
                      size="sm"
                      onClick={() => navigate(`/operator/match/${match.id}`, {
                        state: { requestId, match },
                      })}
                    >
                      View Details
                      <svg className="w-3.5 h-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </Btn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Request Form ───
  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/operator/dashboard')}
            className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body mb-4 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Dashboard
          </button>
          <h1 className="font-display text-3xl font-bold text-dark mb-2">
            New content request
          </h1>
          <p className="font-body text-muted">
            Tell us what you need and we'll find the best local creators for the job.
          </p>
        </div>

        <div className="card space-y-6">
          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-dark mb-2 font-body">
              What type of content do you need?
            </label>
            <div className="flex flex-wrap gap-2">
              {CONTENT_TYPES.map((type) => (
                <Chip
                  key={type}
                  label={type}
                  selected={contentType === type}
                  onClick={() =>
                    setContentType((prev) => (prev === type ? '' : type))
                  }
                />
              ))}
            </div>
          </div>

          {/* Brief */}
          <div>
            <label className="block text-sm font-medium text-dark mb-1.5 font-body">
              What are you looking for?{' '}
              <span className="text-muted font-normal">(optional)</span>
            </label>
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={4}
              placeholder="e.g. Warm, inviting shots of our new seasonal menu. We want to highlight the cozy atmosphere and the care that goes into each dish."
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 font-body">{error}</p>
          )}

          {/* Submit */}
          <div className="pt-2">
            <Btn
              onClick={handleFindMatches}
              disabled={!contentType}
              className="w-full"
              size="lg"
            >
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              Find Matches
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}
