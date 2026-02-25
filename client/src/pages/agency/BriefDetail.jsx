import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAgencyBrief, getAgencyRoster, agencyApply } from '../../api';
import Btn from '../../components/common/Btn';
import StatusBadge from '../../components/common/StatusBadge';
import FadeIn from '../../components/marketing/FadeIn';

const CAMPAIGN_GOAL_LABELS = {
  EVENT_PROMO: 'Event Promo',
  MENU_LAUNCH: 'Menu Launch',
  SEASONAL_SPECIAL: 'Seasonal Special',
  GENERAL_CONTENT: 'General Content',
  GRAND_OPENING: 'Grand Opening',
  SLOW_PERIOD_FILL: 'Slow Period Fill',
};

const COMPENSATION_LABELS = {
  FREE_PRODUCT: 'Free Product',
  FLAT_FEE: 'Flat Fee',
  HYBRID: 'Hybrid',
  COMMISSION: 'Commission',
};

const PLATFORM_LABELS = {
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  REDNOTE: 'RedNote',
  OTHER: 'Other',
};

function formatCents(cents) {
  if (!cents) return null;
  return `$${(cents / 100).toFixed(0)}`;
}

export default function AgencyBriefDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAgency, hasProfile, profile } = useAuth();

  const [brief, setBrief] = useState(null);
  const [roster, setRoster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Apply form
  const [selectedCreator, setSelectedCreator] = useState(null);
  const [pitch, setPitch] = useState('');
  const [compensationAsk, setCompensationAsk] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [briefRes, rosterRes] = await Promise.all([
          getAgencyBrief(id),
          getAgencyRoster(),
        ]);
        setBrief(briefRes.data.brief);
        setRoster(rosterRes.data.creators || []);
      } catch (err) {
        setError('Failed to load brief details.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (!user || !isAgency) return <Navigate to="/" replace />;
  if (!hasProfile) return <Navigate to="/agency/onboarding" replace />;

  const handleSelectCreator = (creator) => {
    setSelectedCreator(creator);
    setSubmitError('');
    // Auto-generate pitch template
    setPitch(
      `${profile?.agencyName} is submitting ${creator.name} (@${creator.handle}) for this campaign. ${creator.bio || ''}`
    );
  };

  const handleSubmit = async () => {
    if (!selectedCreator || !pitch) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await agencyApply(id, {
        creatorId: selectedCreator.id,
        pitch,
        compensationAsk: compensationAsk || null,
        availabilityConfirmed: true,
      });
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-32" />
            <div className="h-10 bg-gray-200 rounded-xl w-3/4" />
            <div className="h-64 bg-gray-200 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !brief) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 font-body mb-4">{error || 'Brief not found'}</p>
            <Btn variant="ghost" onClick={() => navigate('/agency/dashboard')}>Back to Dashboard</Btn>
          </div>
        </div>
      </div>
    );
  }

  const contentTypes = Array.isArray(brief.contentTypes) ? brief.contentTypes : [];

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* Back */}
        <Btn variant="ghost" onClick={() => navigate('/agency/dashboard')} className="mb-6">
          <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back
        </Btn>

        {/* Brief Details */}
        <FadeIn>
          <div className="card mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl font-bold text-dark">{brief.title}</h1>
                  <StatusBadge status={brief.status} />
                </div>
                <p className="text-muted text-sm font-body">
                  {brief.brandProfile?.businessName} &middot; {brief.brandProfile?.neighborhood}, {brief.brandProfile?.city}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-1">Goal</p>
                <p className="text-sm font-medium text-dark">
                  {CAMPAIGN_GOAL_LABELS[brief.campaignGoal] || brief.campaignGoal}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-1">Compensation</p>
                <p className="text-sm font-medium text-dark">
                  {COMPENSATION_LABELS[brief.compensationType] || brief.compensationType}
                  {brief.compensationAmount ? ` (${formatCents(brief.compensationAmount)})` : ''}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-1">Deliverables</p>
                <p className="text-sm font-medium text-dark">{brief.numberOfDeliverables}</p>
              </div>
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-1">Deadline</p>
                <p className="text-sm font-medium text-dark">
                  {brief.deadline ? new Date(brief.deadline).toLocaleDateString() : 'Flexible'}
                </p>
              </div>
            </div>

            {contentTypes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-muted uppercase tracking-wide mb-2">Content Types</p>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((t) => (
                    <span key={t} className="px-3 py-1 rounded-full text-xs font-medium bg-bgTan text-mid border border-border">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted uppercase tracking-wide mb-1">Creative Direction</p>
                <p className="text-sm text-dark font-body">{brief.creativeDirection}</p>
              </div>
              {brief.dos && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Do's</p>
                  <p className="text-sm text-dark font-body">{brief.dos}</p>
                </div>
              )}
              {brief.donts && (
                <div>
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">Don'ts</p>
                  <p className="text-sm text-dark font-body">{brief.donts}</p>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* Submit a Creator */}
        <FadeIn delay={0.1}>
          {submitted ? (
            <div className="card text-center py-10">
              <div className="w-14 h-14 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center">
                <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h3 className="font-display text-xl font-bold text-dark mb-2">Application Submitted!</h3>
              <p className="text-muted text-sm mb-6">
                {selectedCreator?.name} has been submitted for {brief.title}. The brand will review shortly.
              </p>
              <div className="flex justify-center gap-3">
                <Btn variant="ghost" onClick={() => navigate('/agency/dashboard')}>Back to Dashboard</Btn>
                <Btn onClick={() => {
                  setSubmitted(false);
                  setSelectedCreator(null);
                  setPitch('');
                  setCompensationAsk('');
                }} className="!bg-purple-600 hover:!bg-purple-700">Submit Another</Btn>
              </div>
            </div>
          ) : (
            <div className="card">
              <h2 className="font-display text-xl font-semibold text-dark mb-1">Submit a Creator</h2>
              <p className="text-muted text-sm mb-6">Select a creator from your roster to apply on their behalf.</p>

              {roster.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted text-sm mb-4">No creators in your roster yet.</p>
                  <Btn onClick={() => navigate('/agency/roster')} className="!bg-purple-600 hover:!bg-purple-700">
                    Add Creators
                  </Btn>
                </div>
              ) : (
                <>
                  {/* Roster Cards */}
                  <div className="grid gap-3 mb-6">
                    {roster.map((creator) => (
                      <button
                        key={creator.id}
                        onClick={() => handleSelectCreator(creator)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                          selectedCreator?.id === creator.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-border hover:border-purple-200 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-dark text-sm">{creator.name}</p>
                            <p className="text-xs text-muted">
                              @{creator.handle} &middot; {PLATFORM_LABELS[creator.platform] || creator.platform}
                              {creator.followerCount ? ` &middot; ${(creator.followerCount / 1000).toFixed(1)}K` : ''}
                              {creator.engagementRate ? ` &middot; ${creator.engagementRate}% ER` : ''}
                            </p>
                          </div>
                          {selectedCreator?.id === creator.id && (
                            <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                            </div>
                          )}
                        </div>
                        {creator.contentStyleTags && Array.isArray(creator.contentStyleTags) && creator.contentStyleTags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {creator.contentStyleTags.map((tag) => (
                              <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-purple-50 text-purple-600 border border-purple-200">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Pitch + Submit */}
                  {selectedCreator && (
                    <div className="space-y-4 border-t border-border pt-6">
                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Pitch *</label>
                        <textarea
                          value={pitch}
                          onChange={(e) => setPitch(e.target.value)}
                          rows={4}
                          placeholder="Why is this creator a great fit?"
                          className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-dark mb-1">Compensation Ask</label>
                        <input
                          type="text"
                          value={compensationAsk}
                          onChange={(e) => setCompensationAsk(e.target.value)}
                          placeholder="e.g. $300 or 'Accepts offered terms'"
                          className="w-full px-4 py-3 rounded-xl border border-border focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all text-sm"
                        />
                      </div>

                      {submitError && (
                        <div className="bg-red-50 text-red-700 text-sm rounded-xl p-3 border border-red-200">
                          {submitError}
                        </div>
                      )}

                      <div className="flex justify-end">
                        <Btn
                          onClick={handleSubmit}
                          disabled={!pitch}
                          loading={submitting}
                          className="!bg-purple-600 hover:!bg-purple-700"
                        >
                          Submit Application
                        </Btn>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </FadeIn>
      </div>
    </div>
  );
}
