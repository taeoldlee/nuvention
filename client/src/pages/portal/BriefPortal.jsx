import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPortalBriefs, getPortalBrief, submitApplication } from '../../api';

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

const PLATFORMS = [
  { value: 'INSTAGRAM', label: 'Instagram' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'YOUTUBE', label: 'YouTube' },
  { value: 'REDNOTE', label: 'RedNote' },
  { value: 'OTHER', label: 'Other' },
];

const CONTENT_STYLE_OPTIONS = [
  'Clean',
  'Minimalist',
  'Cinematic',
  'Candid',
  'Bright',
  'Moody',
  'Documentary',
  'Lifestyle',
  'Editorial',
  'Raw',
  'Playful',
];

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

// ─── Application Form ───

const EMPTY_FORM = {
  creatorName: '',
  creatorHandle: '',
  creatorPlatform: 'INSTAGRAM',
  followerCount: '',
  engagementRate: '',
  topPostUrls: ['', ''],
  portfolioUrls: [''],
  contentStyleTags: [],
  pitch: '',
  compensationAsk: '',
  availabilityConfirmed: false,
  contactEmail: '',
};

function ApplicationForm({ briefId, onSuccess }) {
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const set = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleStyleTag = (tag) => {
    setForm((prev) => ({
      ...prev,
      contentStyleTags: prev.contentStyleTags.includes(tag)
        ? prev.contentStyleTags.filter((t) => t !== tag)
        : [...prev.contentStyleTags, tag],
    }));
  };

  const setUrlAt = (field, index, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].map((u, i) => (i === index ? value : u)),
    }));
  };

  const addUrl = (field) => {
    const max = field === 'topPostUrls' ? 5 : 5;
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].length < max ? [...prev[field], ''] : prev[field],
    }));
  };

  const removeUrl = (field, index) => {
    const min = field === 'topPostUrls' ? 2 : 0;
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].length > min ? prev[field].filter((_, i) => i !== index) : prev[field],
    }));
  };

  const validate = () => {
    const errors = {};
    if (!form.creatorName.trim()) errors.creatorName = 'Name is required';
    if (!form.creatorHandle.trim()) errors.creatorHandle = 'Handle is required';
    if (!form.pitch.trim()) errors.pitch = 'Pitch is required';
    if (form.pitch.length > 500) errors.pitch = 'Pitch must be 500 characters or fewer';
    if (!form.contactEmail.trim()) errors.contactEmail = 'Email is required';
    if (form.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) {
      errors.contactEmail = 'Enter a valid email address';
    }
    if (!form.availabilityConfirmed) errors.availabilityConfirmed = 'You must confirm availability';
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const data = {
        applicantType: 'INDIVIDUAL',
        creatorName: form.creatorName.trim(),
        creatorHandle: form.creatorHandle.trim().replace(/^@/, ''),
        creatorPlatform: form.creatorPlatform,
        followerCount: form.followerCount ? parseInt(form.followerCount, 10) : null,
        engagementRate: form.engagementRate ? parseFloat(form.engagementRate) : null,
        topPostUrls: form.topPostUrls.filter((u) => u.trim()),
        portfolioUrls: form.portfolioUrls.filter((u) => u.trim()),
        contentStyleTags: form.contentStyleTags,
        pitch: form.pitch.trim(),
        compensationAsk: form.compensationAsk.trim() || null,
        availabilityConfirmed: form.availabilityConfirmed,
        contactEmail: form.contactEmail.trim(),
      };

      // Only send topPostUrls/portfolioUrls if non-empty
      if (data.topPostUrls.length === 0) data.topPostUrls = null;
      if (data.portfolioUrls.length === 0) data.portfolioUrls = null;
      if (data.contentStyleTags.length === 0) data.contentStyleTags = null;

      const res = await submitApplication(briefId, data);
      onSuccess(res.data.application);
    } catch (err) {
      const msg =
        err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-colors';
  const labelClass = 'block text-sm font-semibold text-dark font-body mb-1.5';
  const errorClass = 'text-xs text-red-500 font-body mt-1';

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h3 className="font-display text-xl font-semibold text-dark">Apply to this Brief</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <p className="text-sm text-red-700 font-body">{error}</p>
        </div>
      )}

      {/* Creator Name & Handle */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Creator Name *</label>
          <input
            type="text"
            value={form.creatorName}
            onChange={(e) => set('creatorName', e.target.value)}
            className={inputClass}
            placeholder="Your name"
          />
          {fieldErrors.creatorName && <p className={errorClass}>{fieldErrors.creatorName}</p>}
        </div>
        <div>
          <label className={labelClass}>Handle *</label>
          <input
            type="text"
            value={form.creatorHandle}
            onChange={(e) => set('creatorHandle', e.target.value)}
            className={inputClass}
            placeholder="@yourhandle"
          />
          {fieldErrors.creatorHandle && <p className={errorClass}>{fieldErrors.creatorHandle}</p>}
        </div>
      </div>

      {/* Platform */}
      <div>
        <label className={labelClass}>Primary Platform *</label>
        <select
          value={form.creatorPlatform}
          onChange={(e) => set('creatorPlatform', e.target.value)}
          className={inputClass}
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Followers & Engagement */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Follower Count</label>
          <input
            type="number"
            value={form.followerCount}
            onChange={(e) => set('followerCount', e.target.value)}
            className={inputClass}
            placeholder="e.g. 12500"
            min="0"
          />
        </div>
        <div>
          <label className={labelClass}>Engagement Rate (%)</label>
          <input
            type="number"
            step="0.1"
            value={form.engagementRate}
            onChange={(e) => set('engagementRate', e.target.value)}
            className={inputClass}
            placeholder="e.g. 4.2"
            min="0"
            max="100"
          />
        </div>
      </div>

      {/* Top Post URLs */}
      <div>
        <label className={labelClass}>Top Post URLs (2-5)</label>
        <p className="text-xs text-muted font-body mb-2">Share links to your best performing content.</p>
        <div className="space-y-2">
          {form.topPostUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrlAt('topPostUrls', i, e.target.value)}
                className={inputClass}
                placeholder={`https://instagram.com/p/...`}
              />
              {form.topPostUrls.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeUrl('topPostUrls', i)}
                  className="p-2 text-muted hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Remove URL"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {form.topPostUrls.length < 5 && (
            <button
              type="button"
              onClick={() => addUrl('topPostUrls')}
              className="text-sm text-accent font-semibold font-body hover:text-accent/80 transition-colors"
            >
              + Add another URL
            </button>
          )}
        </div>
      </div>

      {/* Portfolio URLs */}
      <div>
        <label className={labelClass}>Portfolio URLs (optional)</label>
        <p className="text-xs text-muted font-body mb-2">Link to your portfolio, website, or additional samples.</p>
        <div className="space-y-2">
          {form.portfolioUrls.map((url, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrlAt('portfolioUrls', i, e.target.value)}
                className={inputClass}
                placeholder="https://yourportfolio.com"
              />
              {form.portfolioUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeUrl('portfolioUrls', i)}
                  className="p-2 text-muted hover:text-red-500 transition-colors flex-shrink-0"
                  aria-label="Remove URL"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          ))}
          {form.portfolioUrls.length < 5 && (
            <button
              type="button"
              onClick={() => addUrl('portfolioUrls')}
              className="text-sm text-accent font-semibold font-body hover:text-accent/80 transition-colors"
            >
              + Add another URL
            </button>
          )}
        </div>
      </div>

      {/* Content Style Tags */}
      <div>
        <label className={labelClass}>Content Style</label>
        <p className="text-xs text-muted font-body mb-2">Select tags that describe your content style.</p>
        <div className="flex flex-wrap gap-2">
          {CONTENT_STYLE_OPTIONS.map((tag) => {
            const selected = form.contentStyleTags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleStyleTag(tag)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-all duration-200 ${
                  selected
                    ? 'border-accent bg-accentLight text-accent shadow-sm'
                    : 'border-border bg-white text-mid hover:border-accent/50'
                }`}
              >
                {selected && (
                  <svg className="w-3 h-3 mr-1 -ml-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                {tag}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pitch */}
      <div>
        <label className={labelClass}>Pitch *</label>
        <p className="text-xs text-muted font-body mb-2">Tell the brand why you are a great fit for this brief.</p>
        <textarea
          value={form.pitch}
          onChange={(e) => set('pitch', e.target.value)}
          className={`${inputClass} min-h-[120px] resize-y`}
          placeholder="I'd be a great fit because..."
          maxLength={500}
        />
        <div className="flex justify-between mt-1">
          {fieldErrors.pitch ? (
            <p className={errorClass}>{fieldErrors.pitch}</p>
          ) : (
            <span />
          )}
          <span className={`text-xs font-body ${form.pitch.length > 480 ? 'text-red-500' : 'text-muted'}`}>
            {form.pitch.length}/500
          </span>
        </div>
      </div>

      {/* Compensation Ask */}
      <div>
        <label className={labelClass}>Compensation Ask (optional)</label>
        <input
          type="text"
          value={form.compensationAsk}
          onChange={(e) => set('compensationAsk', e.target.value)}
          className={inputClass}
          placeholder='e.g. "$200 flat" or "Accepts offered terms"'
        />
      </div>

      {/* Contact Email */}
      <div>
        <label className={labelClass}>Contact Email *</label>
        <input
          type="email"
          value={form.contactEmail}
          onChange={(e) => set('contactEmail', e.target.value)}
          className={inputClass}
          placeholder="you@example.com"
        />
        {fieldErrors.contactEmail && <p className={errorClass}>{fieldErrors.contactEmail}</p>}
      </div>

      {/* Availability Confirmed */}
      <div>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.availabilityConfirmed}
            onChange={(e) => set('availabilityConfirmed', e.target.checked)}
            className="w-5 h-5 mt-0.5 rounded border-border text-accent focus:ring-accent/40 flex-shrink-0"
          />
          <span className="text-sm font-body text-dark">
            I confirm I am available to complete this project within the specified timeline. *
          </span>
        </label>
        {fieldErrors.availabilityConfirmed && (
          <p className={`${errorClass} ml-8`}>{fieldErrors.availabilityConfirmed}</p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full inline-flex items-center justify-center font-body font-semibold transition-all duration-300 rounded-xl px-6 py-3 text-base bg-accent hover:bg-accent/90 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {submitting ? 'Submitting...' : 'Submit Application'}
      </button>
    </form>
  );
}

// ─── Brief Detail View ───

function BriefDetailView({ brief, onBack }) {
  const [submitted, setSubmitted] = useState(false);
  const [statusToken, setStatusToken] = useState(null);
  const [copied, setCopied] = useState(false);

  const contentTypes = Array.isArray(brief.contentTypes) ? brief.contentTypes : [];
  const vibes = Array.isArray(brief.brandProfile?.vibe) ? brief.brandProfile.vibe : [];

  const handleSuccess = (application) => {
    setStatusToken(application.statusToken);
    setSubmitted(true);
  };

  const statusUrl = statusToken
    ? `${window.location.origin}/portal/application/${statusToken}`
    : null;

  const handleCopyLink = async () => {
    if (!statusUrl) return;
    try {
      await navigator.clipboard.writeText(statusUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for browsers without clipboard API
      const input = document.createElement('input');
      input.value = statusUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-bgWarm">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="card text-center py-12">
            <div className="w-16 h-16 rounded-full bg-greenBg mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-dark mb-2">Application Submitted!</h2>
            <p className="text-muted font-body mb-6 max-w-sm mx-auto">
              Your application has been sent to {brief.brandProfile?.businessName || 'the brand'}.
              They will review it and reach out if you are selected.
            </p>

            {/* Status Tracking Link */}
            {statusUrl && (
              <div className="bg-bgWarm border border-border rounded-xl p-4 mb-6 mx-auto max-w-md">
                <p className="text-sm font-semibold text-dark font-body mb-2">Track Your Application</p>
                <p className="text-xs text-muted font-body mb-3">
                  Bookmark or copy this link to check your application status anytime.
                </p>
                <div className="flex items-center gap-2">
                  <a
                    href={statusUrl}
                    className="flex-1 text-xs text-accent font-body truncate hover:underline"
                  >
                    {statusUrl}
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold font-body border border-border bg-white hover:bg-bgWarm text-mid transition-colors"
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                        Copied
                      </>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={onBack}
              className="inline-flex items-center justify-center font-body font-semibold transition-all duration-300 rounded-xl px-6 py-3 text-base border-2 border-border bg-white hover:bg-bgWarm text-mid hover:shadow-sm"
            >
              Browse More Briefs
            </button>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Application Form */}
        <div className="card">
          <ApplicationForm briefId={brief.id} onSuccess={handleSuccess} />
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
            Browse content opportunities from local businesses. Find a brief that matches your style and apply.
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
