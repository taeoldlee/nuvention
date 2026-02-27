import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPortalBriefs, getPortalBrief } from '../../api';

// ─── Constants ───

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

const USAGE_RIGHTS_LABELS = {
  ORGANIC_SOCIAL: 'Organic Social',
  PAID_ADS: 'Paid Ads',
  IN_STORE: 'In-Store',
  WEBSITE: 'Website',
  ALL: 'All Rights',
};

const LOCATION_LABELS = {
  IN_PERSON: 'In Person',
  REMOTE: 'Remote',
  FLEXIBLE: 'Flexible',
};

const CONTENT_TYPE_LABELS = {
  REEL: 'Reel',
  CAROUSEL: 'Carousel',
  STORY: 'Story',
  TIKTOK: 'TikTok',
  PHOTO_SET: 'Photo Set',
  BLOG_POST: 'Blog Post',
};

// ─── Helpers ───

function formatDeadline(dateStr) {
  if (!dateStr) return 'Flexible';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatCompensation(brief) {
  const type = COMPENSATION_LABELS[brief.compensationType] || brief.compensationType;
  if (brief.compensationAmount) {
    return `${type} -- $${(brief.compensationAmount / 100).toFixed(0)}`;
  }
  return type;
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const diff = (new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24);
  return Math.ceil(diff);
}

// ─── Brief List Card ───

function BriefCard({ brief, onClick }) {
  const contentTypes = Array.isArray(brief.contentTypes) ? brief.contentTypes : [];
  const vibes = Array.isArray(brief.brandProfile?.vibe) ? brief.brandProfile.vibe : [];
  const daysLeft = daysUntil(brief.deadline);

  return (
    <button
      onClick={onClick}
      className="card w-full text-left hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:border-accent/20 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Brand Photo */}
        <div className="w-14 h-14 rounded-xl bg-bgTan border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
          {brief.brandProfile?.profilePhotoUrl ? (
            <img
              src={brief.brandProfile.profilePhotoUrl}
              alt={brief.brandProfile.businessName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextElementSibling && (e.target.nextElementSibling.style.display = 'flex');
              }}
            />
          ) : null}
          <span
            className="text-xl font-bold text-muted"
            style={brief.brandProfile?.profilePhotoUrl ? { display: 'none' } : {}}
          >
            {brief.brandProfile?.businessName?.charAt(0) || '?'}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-body font-semibold text-dark text-lg">{brief.title}</h3>
              <p className="text-sm text-muted font-body">
                {brief.brandProfile?.businessName}
                {brief.brandProfile?.neighborhood && ` \u00B7 ${brief.brandProfile.neighborhood}`}
                {brief.brandProfile?.city && `, ${brief.brandProfile.city}`}
              </p>
            </div>
            {daysLeft != null && daysLeft > 0 && (
              <span className={`flex-shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                daysLeft <= 3 ? 'bg-red-50 text-red-600' : daysLeft <= 7 ? 'bg-yellowBg text-yellowText' : 'bg-bgWarm text-mid'
              }`}>
                {daysLeft}d left
              </span>
            )}
          </div>

          {/* Content Types */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {contentTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accentLight text-accent"
              >
                {CONTENT_TYPE_LABELS[type] || type.replace('_', ' ')}
              </span>
            ))}
          </div>

          {/* Meta Row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted font-body">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
              </svg>
              {formatCompensation(brief)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
              </svg>
              {formatDeadline(brief.deadline)}
            </span>
            {brief.campaignGoal && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
                </svg>
                {CAMPAIGN_GOAL_LABELS[brief.campaignGoal] || brief.campaignGoal}
              </span>
            )}
          </div>

          {/* Vibes */}
          {vibes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {vibes.slice(0, 3).map((v) => (
                <span
                  key={v}
                  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-bgWarm text-mid border border-border"
                >
                  {v}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chevron */}
        <svg className="w-5 h-5 text-muted flex-shrink-0 hidden sm:block mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </div>
    </button>
  );
}

// ─── Brief Detail View ───

function BriefDetailView({ brief, onBack }) {
  const contentTypes = Array.isArray(brief.contentTypes) ? brief.contentTypes : [];
  const vibes = Array.isArray(brief.brandProfile?.vibe) ? brief.brandProfile.vibe : [];

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted hover:text-dark font-body mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          All Briefs
        </button>

        {/* Brief Header */}
        <div className="card mb-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-bgTan border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
              {brief.brandProfile?.profilePhotoUrl ? (
                <img
                  src={brief.brandProfile.profilePhotoUrl}
                  alt={brief.brandProfile.businessName}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              ) : (
                <span className="text-xl font-bold text-muted">
                  {brief.brandProfile?.businessName?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display text-2xl font-bold text-dark">{brief.title}</h1>
              <p className="text-sm text-muted font-body">
                {brief.brandProfile?.businessName}
                {brief.brandProfile?.neighborhood && ` \u00B7 ${brief.brandProfile.neighborhood}`}
                {brief.brandProfile?.city && `, ${brief.brandProfile.city}`}
              </p>
            </div>
          </div>

          {/* Content Types */}
          <div className="flex flex-wrap gap-2 mb-4">
            {contentTypes.map((type) => (
              <span
                key={type}
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accentLight text-accent border border-accent/20"
              >
                {CONTENT_TYPE_LABELS[type] || type.replace('_', ' ')}
              </span>
            ))}
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Compensation</p>
              <p className="text-sm font-semibold text-dark font-body">{formatCompensation(brief)}</p>
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
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Campaign Goal</p>
              <p className="text-sm font-semibold text-dark font-body">
                {CAMPAIGN_GOAL_LABELS[brief.campaignGoal] || brief.campaignGoal}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Usage Rights</p>
              <p className="text-sm font-semibold text-dark font-body">
                {USAGE_RIGHTS_LABELS[brief.usageRights] || brief.usageRights}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-0.5">Location</p>
              <p className="text-sm font-semibold text-dark font-body">
                {LOCATION_LABELS[brief.locationRequirement] || brief.locationRequirement}
              </p>
            </div>
          </div>

          {/* Creative Direction */}
          {brief.creativeDirection && (
            <div className="border-t border-border pt-4 mb-4">
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Creative Direction</p>
              <p className="text-sm text-dark font-body leading-relaxed">{brief.creativeDirection}</p>
            </div>
          )}

          {/* Dos & Don'ts */}
          {(brief.dos || brief.donts) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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

          {/* Additional Notes */}
          {brief.additionalNotes && (
            <div>
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-1">Additional Notes</p>
              <p className="text-sm text-dark font-body leading-relaxed">{brief.additionalNotes}</p>
            </div>
          )}

          {/* Brand Vibes */}
          {vibes.length > 0 && (
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">Brand Vibe</p>
              <div className="flex flex-wrap gap-1.5">
                {vibes.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-bgWarm text-mid border border-border"
                  >
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reference Images */}
          {Array.isArray(brief.referenceImageUrls) && brief.referenceImageUrls.length > 0 && (
            <div className="border-t border-border pt-4 mt-4">
              <p className="text-xs text-muted font-body uppercase tracking-wide mb-2">Reference Images</p>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {brief.referenceImageUrls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Reference ${i + 1}`}
                    className="w-24 h-24 rounded-lg object-cover border border-border flex-shrink-0"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ─── Main Component ───

export default function BriefPortal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [briefs, setBriefs] = useState([]);
  const [selectedBrief, setSelectedBrief] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [compensationType, setCompensationType] = useState('');
  const [contentType, setContentType] = useState('');
  const [campaignGoal, setCampaignGoal] = useState('');
  const [sort, setSort] = useState('newest');
  const searchTimeout = useRef(null);

  // Debounce search input
  useEffect(() => {
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setSearch(searchInput);
    }, 300);
    return () => clearTimeout(searchTimeout.current);
  }, [searchInput]);

  // Reset page to 1 when any filter changes
  useEffect(() => {
    setPage(1);
  }, [search, compensationType, contentType, campaignGoal, sort]);

  const hasActiveFilters = search || compensationType || contentType || campaignGoal || sort !== 'newest';

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setCompensationType('');
    setContentType('');
    setCampaignGoal('');
    setSort('newest');
  };

  // Load briefs list
  useEffect(() => {
    if (id) return; // Skip list load when viewing detail via URL
    setLoading(true);
    setError('');
    const params = { page, limit: 10 };
    if (search) params.search = search;
    if (compensationType) params.compensationType = compensationType;
    if (contentType) params.contentType = contentType;
    if (campaignGoal) params.campaignGoal = campaignGoal;
    if (sort && sort !== 'newest') params.sort = sort;
    getPortalBriefs(params)
      .then((res) => {
        setBriefs(res.data.briefs || []);
        setTotalPages(res.data.totalPages || 1);
      })
      .catch(() => setError('Could not load briefs. Please try again.'))
      .finally(() => setLoading(false));
  }, [id, page, search, compensationType, contentType, campaignGoal, sort]);

  // Load single brief when accessed via URL parameter
  useEffect(() => {
    if (!id) {
      setSelectedBrief(null);
      return;
    }
    setLoading(true);
    setError('');
    getPortalBrief(id)
      .then((res) => setSelectedBrief(res.data.brief))
      .catch(() => setError('Brief not found or no longer available.'))
      .finally(() => setLoading(false));
  }, [id]);

  // Handle clicking a brief from the list
  const handleSelectBrief = (brief) => {
    navigate(`/portal/briefs/${brief.id}`);
  };

  // Handle back from detail view
  const handleBack = () => {
    navigate('/portal/briefs');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-border rounded" />
            <div className="h-4 w-64 bg-border rounded" />
            <div className="space-y-3 mt-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card">
                  <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-xl bg-border" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-48 bg-border rounded" />
                      <div className="h-4 w-32 bg-border rounded" />
                      <div className="h-3 w-full bg-border rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state (without data)
  if (error && !selectedBrief && briefs.length === 0) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <div className="card text-center py-12">
            <p className="text-red-600 font-body mb-4">{error}</p>
            <button
              onClick={() => {
                if (id) navigate('/portal/briefs');
                else window.location.reload();
              }}
              className="inline-flex items-center justify-center font-body font-semibold transition-all duration-300 rounded-xl px-6 py-3 text-base border-2 border-border bg-white hover:bg-bgWarm text-mid hover:shadow-sm"
            >
              {id ? 'Browse All Briefs' : 'Retry'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Detail view
  if (selectedBrief) {
    return <BriefDetailView brief={selectedBrief} onBack={handleBack} />;
  }

  // List view
  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-accent font-semibold font-body uppercase tracking-wider mb-2">Creator Portal</p>
          <h1 className="font-display text-3xl font-bold text-dark mb-2">Open Briefs</h1>
          <p className="text-muted font-body">
            Browse content opportunities from local businesses. Find a brief that matches your style.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl border border-border p-4 mb-6 space-y-3">
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search briefs or brands..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-2">
            <select
              value={compensationType}
              onChange={(e) => setCompensationType(e.target.value)}
              className="appearance-none bg-white border border-border rounded-xl px-3 py-2 text-sm font-body text-dark focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">All Compensation</option>
              <option value="FREE_PRODUCT">Free Product</option>
              <option value="FLAT_FEE">Flat Fee</option>
              <option value="HYBRID">Hybrid</option>
              <option value="COMMISSION">Commission</option>
            </select>

            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="appearance-none bg-white border border-border rounded-xl px-3 py-2 text-sm font-body text-dark focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">All Content</option>
              <option value="REEL">Reel</option>
              <option value="CAROUSEL">Carousel</option>
              <option value="STORY">Story</option>
              <option value="TIKTOK">TikTok</option>
              <option value="PHOTO_SET">Photo Set</option>
              <option value="BLOG_POST">Blog Post</option>
            </select>

            <select
              value={campaignGoal}
              onChange={(e) => setCampaignGoal(e.target.value)}
              className="appearance-none bg-white border border-border rounded-xl px-3 py-2 text-sm font-body text-dark focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="">All Goals</option>
              <option value="EVENT_PROMO">Event Promo</option>
              <option value="MENU_LAUNCH">Menu Launch</option>
              <option value="SEASONAL_SPECIAL">Seasonal Special</option>
              <option value="GENERAL_CONTENT">General Content</option>
              <option value="GRAND_OPENING">Grand Opening</option>
              <option value="SLOW_PERIOD_FILL">Slow Period Fill</option>
            </select>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none bg-white border border-border rounded-xl px-3 py-2 text-sm font-body text-dark focus:outline-none focus:ring-2 focus:ring-accent/20"
            >
              <option value="newest">Newest First</option>
              <option value="deadline">Deadline Soonest</option>
              <option value="compensation">Highest Pay</option>
            </select>
          </div>

          {/* Active filters indicator + clear button */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <button
                onClick={clearFilters}
                className="text-xs font-body font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* Brief List */}
        {briefs.length === 0 ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-bgWarm shadow-sm mx-auto mb-4 flex items-center justify-center text-muted">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
              </svg>
            </div>
            <h3 className="font-display text-lg font-semibold text-dark mb-2">
              {hasActiveFilters ? 'No briefs match your filters' : 'No open briefs right now'}
            </h3>
            <p className="text-muted text-sm font-body max-w-sm mx-auto">
              {hasActiveFilters
                ? 'Try adjusting your search or filters to find more opportunities.'
                : 'Check back soon -- new content opportunities are posted regularly by local businesses.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm font-body font-semibold text-accent hover:text-accent/80 transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {briefs.map((brief) => (
                <BriefCard
                  key={brief.id}
                  brief={brief}
                  onClick={() => handleSelectBrief(brief)}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold font-body border border-border bg-white hover:bg-bgWarm text-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                  Prev
                </button>
                <span className="text-sm font-body text-muted">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold font-body border border-border bg-white hover:bg-bgWarm text-mid transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
