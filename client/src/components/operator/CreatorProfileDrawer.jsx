import { useState, useEffect, useRef } from 'react';
import { getApplicationProfile } from '../../api';
import { getCreatorTier } from './ApplicationFilters';

const PLATFORM_LABELS = {
  INSTAGRAM: 'Instagram',
  TIKTOK: 'TikTok',
  YOUTUBE: 'YouTube',
  REDNOTE: 'RedNote',
  OTHER: 'Other',
};

const STATUS_LABELS = {
  PENDING: 'Pending',
  SELECTED: 'Selected',
  DECLINED: 'Declined',
  WITHDRAWN: 'Withdrawn',
  REJECTED: 'Rejected',
};

function formatFollowerCount(count) {
  if (!count) return '--';
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function MatchScoreBar({ score }) {
  if (score == null) return <span className="text-sm text-muted">Not scored</span>;
  const pct = Math.round(score);
  let barColor = 'bg-gray-300';
  if (pct >= 80) barColor = 'bg-green';
  else if (pct >= 60) barColor = 'bg-yellow-500';
  else if (pct >= 40) barColor = 'bg-orange-500';
  else barColor = 'bg-red-500';

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-semibold text-dark">{pct}%</span>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-xs text-muted font-body uppercase tracking-wide mb-1.5">{children}</p>
  );
}

function isSafeUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

function LinkList({ urls, label }) {
  const list = Array.isArray(urls) ? urls.filter((u) => u && isSafeUrl(u)) : [];
  if (list.length === 0) return null;

  return (
    <div>
      <SectionLabel>{label}</SectionLabel>
      <ul className="space-y-1.5">
        {list.map((url, i) => (
          <li key={i}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-accent hover:text-accent/80 font-body underline underline-offset-2 break-all"
            >
              {url}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function CreatorProfileDrawer({ applicationId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const backdropRef = useRef(null);

  useEffect(() => {
    if (!applicationId) return;
    setLoading(true);
    setError('');
    getApplicationProfile(applicationId)
      .then((res) => {
        setData(res.data);
      })
      .catch(() => {
        setError('Could not load creator profile.');
      })
      .finally(() => setLoading(false));
  }, [applicationId]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  const app = data?.application;
  const pastRankings = data?.pastRankings || [];
  const tags = app ? (Array.isArray(app.contentStyleTags) ? app.contentStyleTags : []) : [];
  const demographics = app?.audienceDemographics;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
    >
      {/* Drawer panel - full width on mobile, 480px on desktop */}
      <div className="absolute inset-y-0 right-0 w-full sm:max-w-[480px] bg-white shadow-2xl overflow-y-auto animate-slide-in-right">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-dark">Creator Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-bgWarm transition-colors text-muted hover:text-dark"
            aria-label="Close drawer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6">
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-border" />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-32 bg-border rounded" />
                  <div className="h-4 w-48 bg-border rounded" />
                </div>
              </div>
              <div className="h-20 bg-border rounded-lg" />
              <div className="h-20 bg-border rounded-lg" />
              <div className="h-32 bg-border rounded-lg" />
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 font-body text-sm">{error}</p>
            </div>
          )}

          {app && !loading && (
            <>
              {/* Creator identity */}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-full bg-accentLight flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-bold text-accent">
                    {app.creatorName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-xl font-bold text-dark">{app.creatorName}</h3>
                  <p className="text-sm text-muted font-body">
                    @{app.creatorHandle}
                    <span className="text-border mx-1.5">|</span>
                    {PLATFORM_LABELS[app.creatorPlatform] || app.creatorPlatform}
                  </p>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-bgWarm rounded-xl p-3 text-center border border-border">
                  <p className="text-lg font-bold text-dark font-body">{formatFollowerCount(app.followerCount)}</p>
                  <p className="text-xs text-muted font-body">Followers</p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full bg-bgTan text-mid border border-border mt-1 inline-block">
                    {getCreatorTier(app.followerCount)}
                  </span>
                </div>
                <div className="bg-bgWarm rounded-xl p-3 text-center border border-border">
                  <p className={`text-lg font-bold font-body ${
                    app.engagementRate >= 4 ? 'text-green' : app.engagementRate >= 2 ? 'text-dark' : 'text-muted'
                  }`}>
                    {app.engagementRate != null ? `${app.engagementRate.toFixed(1)}%` : '--'}
                  </p>
                  <p className="text-xs text-muted font-body">Eng. Rate</p>
                </div>
                <div className="bg-bgWarm rounded-xl p-3 text-center border border-border">
                  <p className="text-lg font-bold text-dark font-body">
                    {app.compensationAsk || '--'}
                  </p>
                  <p className="text-xs text-muted font-body">Ask</p>
                </div>
              </div>

              {/* AI Match Score */}
              <div className="bg-bgWarm rounded-xl p-4 border border-border">
                <SectionLabel>AI Match Score</SectionLabel>
                <MatchScoreBar score={app.aiMatchScore} />
                {app.aiMatchRationale && (
                  <p className="text-sm text-dark font-body leading-relaxed mt-2">
                    {app.aiMatchRationale}
                  </p>
                )}
              </div>

              {/* Content Style Tags */}
              {tags.length > 0 && (
                <div>
                  <SectionLabel>Content Style</SectionLabel>
                  <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Full Pitch */}
              {app.pitch && (
                <div>
                  <SectionLabel>Pitch</SectionLabel>
                  <div className="bg-bgWarm rounded-xl p-4 border border-border">
                    <p className="text-sm text-dark font-body leading-relaxed whitespace-pre-wrap">{app.pitch}</p>
                  </div>
                </div>
              )}

              {/* Portfolio URLs */}
              <LinkList urls={app.portfolioUrls} label="Portfolio" />

              {/* Top Post URLs */}
              <LinkList urls={app.topPostUrls} label="Top Posts" />

              {/* Audience Demographics */}
              {demographics && (
                <div>
                  <SectionLabel>Audience Demographics</SectionLabel>
                  <div className="bg-bgWarm rounded-xl p-4 border border-border text-sm text-dark font-body">
                    {demographics.ageBreakdown && (
                      <div className="mb-2">
                        <span className="text-muted">Age: </span>
                        {Object.entries(demographics.ageBreakdown).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </div>
                    )}
                    {demographics.locationBreakdown && (
                      <div className="mb-2">
                        <span className="text-muted">Location: </span>
                        {Object.entries(demographics.locationBreakdown).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </div>
                    )}
                    {demographics.genderBreakdown && (
                      <div>
                        <span className="text-muted">Gender: </span>
                        {Object.entries(demographics.genderBreakdown).map(([k, v]) => `${k}: ${v}`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Past Rankings */}
              <div>
                <SectionLabel>Past Rankings by Your Brand</SectionLabel>
                {pastRankings.length === 0 ? (
                  <p className="text-sm text-muted font-body">
                    This is the first time @{app.creatorHandle} has applied to one of your briefs.
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-muted font-body mb-2">
                      Previously applied to {pastRankings.length} other brief{pastRankings.length !== 1 ? 's' : ''} from your brand.
                    </p>
                    <div className="space-y-2">
                      {pastRankings.map((pr) => (
                        <div
                          key={pr.id}
                          className="bg-bgWarm rounded-lg p-3 border border-border flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-dark font-body truncate">
                              {pr.brief.title}
                            </p>
                            <p className="text-xs text-muted font-body">
                              {formatDate(pr.createdAt)}
                              <span className="text-border mx-1">|</span>
                              {STATUS_LABELS[pr.status] || pr.status}
                            </p>
                          </div>
                          {pr.aiMatchScore != null && (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${
                              pr.aiMatchScore >= 80 ? 'bg-greenBg text-green' :
                              pr.aiMatchScore >= 60 ? 'bg-yellowBg text-yellowText' :
                              pr.aiMatchScore >= 40 ? 'bg-orange-50 text-orange-700' :
                              'bg-red-50 text-red-600'
                            }`}>
                              {Math.round(pr.aiMatchScore)}%
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
