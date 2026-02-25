import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import client from '../../api/client';
import FadeIn from '../../components/marketing/FadeIn';
import StatCard from '../../components/common/StatCard';

const TIER_ORDER = ['NANO', 'MICRO', 'MID', 'MACRO'];
const TIER_LABELS = { NANO: 'Nano (< 5K)', MICRO: 'Micro (5–25K)', MID: 'Mid (25–100K)', MACRO: 'Macro (100K+)' };
const OFFER_LABELS = { FREE_PRODUCT: 'Free Product', FLAT_FEE: 'Flat Fee', HYBRID: 'Hybrid', COMMISSION: 'Commission' };
const CONTENT_LABELS = { REEL: 'Reel', CAROUSEL: 'Carousel', STORY: 'Story', TIKTOK: 'TikTok', PHOTO_SET: 'Photo Set', BLOG_POST: 'Blog Post' };

function OfferBar({ type, data }) {
  const label = OFFER_LABELS[type] || type.replace(/_/g, ' ');
  const rate = data?.rate ?? 0;
  const barColors = {
    FREE_PRODUCT: 'bg-accent',
    FLAT_FEE: 'bg-green',
    HYBRID: 'bg-yellowText',
    COMMISSION: 'bg-muted',
  };
  const barColor = barColors[type] || 'bg-accent';

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm font-body">
        <span className="text-dark font-medium">{label}</span>
        <div className="flex items-center gap-2">
          <span className="text-muted">{data?.accepted ?? 0}/{data?.total ?? 0}</span>
          <span className="font-semibold text-dark w-10 text-right">{rate}%</span>
        </div>
      </div>
      <div className="h-3 bg-bgTan rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${rate}%` }}
        />
      </div>
    </div>
  );
}

function TierCard({ tier, data, isBest }) {
  const label = TIER_LABELS[tier] || tier;
  return (
    <div
      className={`card transition-all duration-200 ${isBest ? 'border-accent/30 bg-accentLight/20' : ''}`}
    >
      {isBest && (
        <div className="flex items-center gap-1 mb-3">
          <svg className="w-3.5 h-3.5 text-accent" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          <span className="text-[10px] font-semibold text-accent font-body uppercase tracking-wide">Best Performer</span>
        </div>
      )}
      <h3 className="font-display text-base font-semibold text-dark mb-3">{label}</h3>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-body">Campaigns</span>
          <span className="text-sm font-semibold text-dark font-body">{data?.campaigns ?? 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-body">Acceptance Rate</span>
          <span className="text-sm font-semibold text-dark font-body">{data?.avgAcceptanceRate ?? 0}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted font-body">Avg Response Time</span>
          <span className="text-sm font-semibold text-dark font-body">
            {data?.avgResponseTime ? `${data.avgResponseTime} min` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}

function BlurredPreview() {
  return (
    <div className="relative">
      <div className="blur-sm pointer-events-none select-none opacity-60">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card">
              <div className="h-8 bg-border/50 rounded w-16 mb-2" />
              <div className="h-3 bg-border/50 rounded w-20" />
            </div>
          ))}
        </div>
        <div className="card mb-6">
          <div className="h-5 bg-border/50 rounded w-40 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex justify-between">
                  <div className="h-4 bg-border/50 rounded w-24" />
                  <div className="h-4 bg-border/50 rounded w-12" />
                </div>
                <div className="h-3 bg-border/50 rounded-full" />
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card">
              <div className="h-4 bg-border/50 rounded w-20 mb-3" />
              <div className="space-y-2">
                <div className="h-3 bg-border/50 rounded" />
                <div className="h-3 bg-border/50 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await client.get('/stats/insights');
        setData(res.data);
      } catch (err) {
        setError('Could not load insights.');
        console.error('[InsightsPage] load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-border/50 rounded w-48" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="card h-20 bg-border/20" />
              ))}
            </div>
            <div className="card h-48 bg-border/20" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 font-body mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-accent text-white text-sm font-semibold font-body"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Header */}
        <FadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-8 gap-4">
            <div>
              <p className="section-label mb-2">Analytics</p>
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-dark mb-1">
                Campaign Insights
              </h1>
              <p className="font-body text-muted text-sm">
                Learn what works in your area.
              </p>
            </div>
            <button
              onClick={() => navigate('/operator/dashboard')}
              className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body transition-colors self-start sm:self-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Dashboard
            </button>
          </div>
        </FadeIn>

        {/* Locked state */}
        {!data?.unlocked && (
          <FadeIn delay={0.1}>
            <div className="card text-center py-12 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-bgTan border border-border mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h2 className="font-display text-xl font-semibold text-dark mb-2">Unlock Your Insights</h2>
              <p className="text-muted text-sm font-body max-w-sm mx-auto mb-6">
                Complete <span className="font-semibold text-dark">3 campaigns</span> to unlock your full insights dashboard with acceptance rates, creator performance, and AI recommendations.
              </p>

              {/* Progress bar */}
              <div className="max-w-xs mx-auto mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted font-body">Progress</span>
                  <span className="text-xs font-semibold text-dark font-body">{data?.count ?? 0} / 3</span>
                </div>
                <div className="h-3 bg-bgTan rounded-full overflow-hidden border border-border">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, ((data?.count ?? 0) / 3) * 100)}%` }}
                  />
                </div>
              </div>
              <p className="text-xs text-muted font-body mb-8">
                {Math.max(0, 3 - (data?.count ?? 0))} more campaign{3 - (data?.count ?? 0) !== 1 ? 's' : ''} to go
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm text-muted font-body text-center mb-4">Preview of what you'll unlock:</p>
              <BlurredPreview />
            </div>
          </FadeIn>
        )}

        {/* Unlocked state */}
        {data?.unlocked && (
          <>
            {/* Row 1: Quick Stats */}
            <FadeIn delay={0.1}>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                  label="Total Campaigns"
                  value={data.totalCampaigns}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                    </svg>
                  }
                />
                <StatCard
                  label="Avg Acceptance Rate"
                  value={`${data.avgAcceptanceRate}%`}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <StatCard
                  label="Best Offer Type"
                  value={OFFER_LABELS[data.bestOfferType] || (data.bestOfferType || '—').replace(/_/g, ' ')}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33" />
                    </svg>
                  }
                />
                <StatCard
                  label="Avg Response Time"
                  value={data.avgResponseTime ? `${data.avgResponseTime}m` : '—'}
                  icon={
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
              </div>
            </FadeIn>

            {/* Row 2: Acceptance Rate by Offer Type */}
            <FadeIn delay={0.15}>
              <div className="card mb-6">
                <h2 className="font-display text-lg font-semibold text-dark mb-5">Acceptance Rate by Offer Type</h2>
                <div className="space-y-4">
                  {Object.entries(data.acceptanceByOfferType || {}).map(([type, info]) => (
                    <OfferBar key={type} type={type} data={info} />
                  ))}
                  {Object.keys(data.acceptanceByOfferType || {}).length === 0 && (
                    <p className="text-sm text-muted font-body">No data yet.</p>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Row 3: Creator Tier Performance */}
            <FadeIn delay={0.2}>
              <div className="mb-6">
                <h2 className="font-display text-lg font-semibold text-dark mb-4">Creator Tier Performance</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {TIER_ORDER.filter((t) => data.creatorTierPerformance?.[t]).map((tier) => {
                    const tierData = data.creatorTierPerformance[tier];
                    const allRates = Object.values(data.creatorTierPerformance).map((d) => d.avgAcceptanceRate);
                    const maxRate = Math.max(...allRates);
                    const isBest = tierData.avgAcceptanceRate === maxRate && maxRate > 0;
                    return <TierCard key={tier} tier={tier} data={tierData} isBest={isBest} />;
                  })}
                  {Object.keys(data.creatorTierPerformance || {}).length === 0 && (
                    <p className="text-sm text-muted font-body col-span-3">No tier data yet.</p>
                  )}
                </div>
              </div>
            </FadeIn>

            {/* Row 4: Neighborhood Benchmarks */}
            <FadeIn delay={0.25}>
              <div className="card mb-6">
                <h2 className="font-display text-lg font-semibold text-dark mb-4">Neighborhood Benchmarks</h2>
                {(data.neighborhoodBenchmarks || []).length > 0 ? (
                  <div className="overflow-x-auto -mx-2">
                    <table className="w-full text-sm font-body">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left text-xs text-muted uppercase tracking-wide font-semibold pb-2 px-2">Neighborhood</th>
                          <th className="text-right text-xs text-muted uppercase tracking-wide font-semibold pb-2 px-2">Campaigns</th>
                          <th className="text-right text-xs text-muted uppercase tracking-wide font-semibold pb-2 px-2">Acceptance</th>
                          <th className="text-right text-xs text-muted uppercase tracking-wide font-semibold pb-2 px-2 hidden sm:table-cell">Top Content</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.neighborhoodBenchmarks.map((nb) => (
                          <tr key={nb.neighborhood} className="border-b border-border/50 hover:bg-bgWarm/50 transition-colors">
                            <td className="py-3 px-2 font-medium text-dark">{nb.neighborhood}</td>
                            <td className="py-3 px-2 text-right text-muted">{nb.campaigns}</td>
                            <td className="py-3 px-2 text-right">
                              <span className={`font-semibold ${
                                nb.acceptanceRate >= 70 ? 'text-green' :
                                nb.acceptanceRate >= 50 ? 'text-yellowText' : 'text-accent'
                              }`}>
                                {nb.acceptanceRate}%
                              </span>
                            </td>
                            <td className="py-3 px-2 text-right text-muted hidden sm:table-cell">
                              {CONTENT_LABELS[nb.topContentType] || nb.topContentType}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-muted font-body">No neighborhood data yet.</p>
                )}
              </div>
            </FadeIn>

            {/* Row 5: AI Recommendation */}
            {data.aiRecommendation && (
              <FadeIn delay={0.3}>
                <div className="rounded-xl border border-border bg-bgWarm/70 border-l-4 border-l-green p-5 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-greenBg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-4 h-4 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-green font-body uppercase tracking-wide mb-1.5">AI Recommendation</p>
                      <p className="text-sm text-dark font-body leading-relaxed">{data.aiRecommendation}</p>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}
          </>
        )}
      </div>
    </div>
  );
}
