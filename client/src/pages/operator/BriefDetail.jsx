import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBrief, selectApplication, rejectApplication } from '../../api';
import { useToast } from '../../contexts/ToastContext';
import Btn from '../../components/common/Btn';
import StatusBadge from '../../components/common/StatusBadge';
import FadeIn from '../../components/marketing/FadeIn';
import ApplicationFilters, { getCreatorTier } from '../../components/operator/ApplicationFilters';
import CreatorProfileDrawer from '../../components/operator/CreatorProfileDrawer';

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

const CONTENT_TYPE_ICONS = {
  REEL: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  CAROUSEL: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-1.243 1.007-2.25 2.25-2.25h13.5" />
    </svg>
  ),
  STORY: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3" />
    </svg>
  ),
  PHOTO_SET: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
    </svg>
  ),
  TIKTOK: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
  ),
  BLOG_POST: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
};

const PLATFORM_LABELS = {
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  REDNOTE: 'RedNote',
  OTHER: 'Other',
};

function formatFollowerCount(count) {
  if (!count) return '--';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function formatCompensationAmount(brief) {
  if (!brief) return '--';
  const type = COMPENSATION_LABELS[brief.compensationType] || brief.compensationType;
  if (brief.compensationAmount) {
    return `${type} - $${(brief.compensationAmount / 100).toFixed(0)}`;
  }
  return type;
}

function formatDeadline(dateStr) {
  if (!dateStr) return 'No deadline';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function MatchScoreBadge({ score }) {
  if (score == null) return null;
  const pct = Math.round(score);
  let color = 'bg-gray-100 text-gray-600';
  if (pct >= 80) color = 'bg-greenBg text-green';
  else if (pct >= 60) color = 'bg-yellowBg text-yellowText';
  else if (pct >= 40) color = 'bg-orange-50 text-orange-700';
  else color = 'bg-red-50 text-red-600';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${color}`}>
      {pct}% match
    </span>
  );
}

function ApplicationCard({ application, onSelect, onReject, onViewProfile, actionLoading }) {
  const {
    id,
    creatorName,
    creatorHandle,
    creatorPlatform,
    followerCount,
    engagementRate,
    pitch,
    aiMatchScore,
    contentStyleTags,
    compensationAsk,
    status,
  } = application;

  const isActioned = status !== 'PENDING';
  const tags = Array.isArray(contentStyleTags) ? contentStyleTags : [];

  return (
    <div className={`card transition-all duration-300 ${isActioned ? 'opacity-60' : 'hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-accent/20'}`}>
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Avatar + Basic Info */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full bg-accentLight flex items-center justify-center flex-shrink-0">
            <span className="text-lg font-bold text-accent">
              {creatorName?.charAt(0)?.toUpperCase() || '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onViewProfile(id)}
                className="font-body font-semibold text-dark truncate hover:text-accent transition-colors text-left cursor-pointer"
              >
                {creatorName}
              </button>
              <MatchScoreBadge score={aiMatchScore} />
              {isActioned && <StatusBadge status={status} />}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted font-body mt-0.5">
              <button
                type="button"
                onClick={() => onViewProfile(id)}
                className="hover:text-accent transition-colors cursor-pointer"
              >
                @{creatorHandle}
              </button>
              <span className="text-border">|</span>
              <span>{PLATFORM_LABELS[creatorPlatform] || creatorPlatform}</span>
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-4 mt-2 text-sm font-body flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-muted">Followers: </span>
                <span className="font-semibold text-dark">{formatFollowerCount(followerCount)}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-bgTan text-mid border border-border">
                  {getCreatorTier(followerCount)}
                </span>
              </div>
              {engagementRate != null && (
                <div>
                  <span className="text-muted">Eng. Rate: </span>
                  <span className={`font-semibold ${engagementRate >= 4 ? 'text-green' : engagementRate >= 2 ? 'text-dark' : 'text-muted'}`}>
                    {engagementRate.toFixed(1)}%
                  </span>
                </div>
              )}
              {compensationAsk && (
                <div>
                  <span className="text-muted">Ask: </span>
                  <span className="font-semibold text-dark">{compensationAsk}</span>
                </div>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bgWarm text-mid border border-border"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Pitch */}
            {pitch && (
              <div className="mt-3 bg-bgWarm rounded-lg p-3 border border-border">
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Pitch</p>
                <p className="text-sm text-dark font-body leading-relaxed">{pitch}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isActioned && (
          <div className="flex sm:flex-col gap-2 flex-shrink-0">
            <Btn
              size="sm"
              onClick={() => onSelect(id)}
              loading={actionLoading === `select-${id}`}
              disabled={!!actionLoading}
            >
              Select Creator
            </Btn>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => onReject(id)}
              loading={actionLoading === `reject-${id}`}
              disabled={!!actionLoading}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
            >
              Reject
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}

export default function BriefDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');
  const [filteredApps, setFilteredApps] = useState(null);
  const [profileAppId, setProfileAppId] = useState(null);
  const { addToast } = useToast();

  const loadBrief = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getBrief(id);
      setBrief(res.data.brief);
    } catch {
      setError('Could not load brief details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrief();
  }, [id]);

  const handleSelect = async (applicationId) => {
    setActionLoading(`select-${applicationId}`);
    try {
      await selectApplication(applicationId);
      addToast('Creator selected! A project has been created.', 'success');
      await loadBrief();
    } catch {
      const msg = 'Could not select this creator. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setActionLoading('');
    }
  };

  const handleReject = async (applicationId) => {
    setActionLoading(`reject-${applicationId}`);
    try {
      await rejectApplication(applicationId);
      addToast('Application declined.', 'info');
      await loadBrief();
    } catch {
      const msg = 'Could not reject this application. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setActionLoading('');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-6 w-48 bg-border rounded" />
            <div className="card space-y-4">
              <div className="h-8 w-64 bg-border rounded" />
              <div className="h-4 w-full bg-border rounded" />
              <div className="h-4 w-3/4 bg-border rounded" />
            </div>
            <div className="card h-48 bg-border rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (error && !brief) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 font-body mb-4">{error}</p>
            <Btn onClick={() => navigate('/operator/dashboard')}>Back to Dashboard</Btn>
          </div>
        </div>
      </div>
    );
  }

  const contentTypes = Array.isArray(brief.contentTypes) ? brief.contentTypes : [];
  const applications = Array.isArray(brief.applications) ? brief.applications : [];
  const displayApps = filteredApps ?? applications;
  const pendingApps = displayApps.filter((a) => a.status === 'PENDING');
  const actionedApps = displayApps.filter((a) => a.status !== 'PENDING');

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

        {/* Brief Header */}
        <FadeIn>
          <div className="card mb-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="font-display text-2xl font-bold text-dark">{brief.title}</h1>
                  <StatusBadge status={brief.status} />
                </div>
                <p className="text-sm text-muted font-body mb-4">
                  {CAMPAIGN_GOAL_LABELS[brief.campaignGoal] || brief.campaignGoal}
                  {brief.brandProfile?.businessName && ` \u00B7 ${brief.brandProfile.businessName}`}
                </p>

                {/* Content Types */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {contentTypes.map((type) => (
                    <span
                      key={type}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
                    >
                      {CONTENT_TYPE_ICONS[type] || null}
                      {type.replace('_', ' ')}
                    </span>
                  ))}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Compensation</p>
                    <p className="text-sm font-semibold text-dark font-body">{formatCompensationAmount(brief)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Deadline</p>
                    <p className="text-sm font-semibold text-dark font-body">{formatDeadline(brief.deadline)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Deliverables</p>
                    <p className="text-sm font-semibold text-dark font-body">{brief.numberOfDeliverables || '--'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Applications</p>
                    <p className="text-sm font-semibold text-dark font-body">{applications.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Creative Direction */}
            {brief.creativeDirection && (
              <div className="mt-5 pt-5 border-t border-border">
                <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Creative Direction</p>
                <p className="text-sm text-dark font-body leading-relaxed">{brief.creativeDirection}</p>
              </div>
            )}

            {/* Dos & Don'ts */}
            {(brief.dos || brief.donts) && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {brief.dos && (
                  <div className="bg-greenBg/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-green uppercase tracking-wide mb-1">Do's</p>
                    <p className="text-sm text-dark font-body leading-relaxed">{brief.dos}</p>
                  </div>
                )}
                {brief.donts && (
                  <div className="bg-red-50/50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-1">Don'ts</p>
                    <p className="text-sm text-dark font-body leading-relaxed">{brief.donts}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </FadeIn>

        {/* Error Banner */}
        {error && brief && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}

        {/* Applications Section */}
        <FadeIn delay={0.15}>
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-dark">
                Applications
                {applications.length > 0 && (
                  <span className="text-muted font-normal text-base ml-2">
                    ({pendingApps.length} pending{actionedApps.length > 0 ? `, ${actionedApps.length} reviewed` : ''})
                  </span>
                )}
              </h2>
            </div>

            {applications.length === 0 ? (
              <div className="card text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-bgWarm shadow-sm mx-auto mb-4 flex items-center justify-center text-muted">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                  </svg>
                </div>
                <h3 className="font-display text-lg font-semibold text-dark mb-2">No applications yet</h3>
                <p className="text-muted text-sm font-body max-w-sm mx-auto">
                  {brief.status === 'OPEN'
                    ? 'Your brief is live. Applications from creators will appear here as they come in.'
                    : 'This brief is not currently accepting applications.'}
                </p>
              </div>
            ) : (
              <>
                <ApplicationFilters applications={applications} onChange={setFilteredApps} />
                <div className="space-y-3">
                {/* Pending applications first, sorted by match score */}
                {pendingApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onSelect={handleSelect}
                    onReject={handleReject}
                    onViewProfile={setProfileAppId}
                    actionLoading={actionLoading}
                  />
                ))}
                {/* Reviewed applications below */}
                {actionedApps.length > 0 && pendingApps.length > 0 && (
                  <div className="flex items-center gap-3 py-2">
                    <div className="h-px flex-1 bg-border" />
                    <span className="text-xs text-muted font-body uppercase tracking-wide">Reviewed</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
                {actionedApps.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onSelect={handleSelect}
                    onReject={handleReject}
                    onViewProfile={setProfileAppId}
                    actionLoading={actionLoading}
                  />
                ))}
              </div>
              </>
            )}
          </section>
        </FadeIn>
      </div>

      {/* Creator Profile Drawer */}
      {profileAppId && (
        <CreatorProfileDrawer
          applicationId={profileAppId}
          onClose={() => setProfileAppId(null)}
        />
      )}
    </div>
  );
}
