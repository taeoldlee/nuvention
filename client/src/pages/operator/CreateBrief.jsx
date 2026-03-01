import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { createBrief } from '../../api';
import Btn from '../../components/common/Btn';
import FadeIn from '../../components/marketing/FadeIn';

const CONTENT_TYPES = [
  { value: 'REEL', label: 'Reel' },
  { value: 'CAROUSEL', label: 'Carousel' },
  { value: 'STORY', label: 'Story' },
  { value: 'TIKTOK', label: 'TikTok' },
  { value: 'PHOTO_SET', label: 'Photo Set' },
  { value: 'BLOG_POST', label: 'Blog Post' },
];

const COMPENSATION_TYPES = [
  { value: 'FREE_PRODUCT', label: 'Free Product' },
  { value: 'FLAT_FEE', label: 'Flat Fee' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'COMMISSION', label: 'Commission' },
];

const USAGE_RIGHTS = [
  { value: 'ORGANIC_SOCIAL', label: 'Organic Social' },
  { value: 'PAID_ADS', label: 'Paid Ads' },
  { value: 'IN_STORE', label: 'In-Store' },
  { value: 'WEBSITE', label: 'Website' },
  { value: 'ALL', label: 'All Rights' },
];

const LOCATION_REQUIREMENTS = [
  { value: 'IN_PERSON', label: 'In Person' },
  { value: 'REMOTE', label: 'Remote' },
  { value: 'FLEXIBLE', label: 'Flexible' },
];

const inputClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all';

const selectClass =
  'w-full px-4 py-3 rounded-xl border border-border bg-white text-dark font-body text-sm focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent transition-all appearance-none';

const labelClass = 'block text-sm font-medium text-dark mb-1.5 font-body';

const AUTO_SAVE_KEY = 'locale_brief_draft';
const AUTO_SAVE_DELAY = 1000;

// ─── Pre-fill mapping from brand goal ───

const GOAL_PREFILLS = {
  fill_slow_days: {
    campaignGoal: 'SLOW_PERIOD_FILL',
    titleTemplate: 'Weekday Vibes at {name}',
    contentTypes: ['REEL', 'STORY'],
    creativeDirection: 'Capture the relaxed weekday atmosphere — cozy corners, quiet moments, the kind of visit that makes people want to come back on a Tuesday.',
    compensationType: 'FREE_PRODUCT',
  },
  attract_new_faces: {
    campaignGoal: 'GENERAL_CONTENT',
    titleTemplate: 'Discover {name}',
    contentTypes: ['REEL', 'TIKTOK'],
    creativeDirection: 'Introduce us to someone who has never been here. Show the experience from walking in to the first bite — make it feel like a personal recommendation.',
    compensationType: 'FLAT_FEE',
  },
  reach_different_crowd: {
    campaignGoal: 'GENERAL_CONTENT',
    titleTemplate: 'Experience {name}',
    contentTypes: ['REEL', 'TIKTOK'],
    creativeDirection: 'Show a different side of us — something that would resonate with a new audience. Think fresh perspective, unexpected angles.',
    compensationType: 'FLAT_FEE',
  },
  launch_menu_item: {
    campaignGoal: 'MENU_LAUNCH',
    titleTemplate: 'New Menu at {name}',
    contentTypes: ['REEL', 'CAROUSEL'],
    creativeDirection: 'Feature the new item front and center. Close-ups, first-bite reactions, beautiful plating — make people crave it.',
    compensationType: 'HYBRID',
  },
  hype_event: {
    campaignGoal: 'EVENT_PROMO',
    titleTemplate: 'Event at {name}',
    contentTypes: ['REEL', 'STORY'],
    creativeDirection: 'Build anticipation for the event. Tease the setup, the energy, the vibe — make people feel like they need to be there.',
    compensationType: 'FLAT_FEE',
  },
  grow_social_media: {
    campaignGoal: 'GENERAL_CONTENT',
    titleTemplate: 'Content for {name}',
    contentTypes: ['REEL', 'TIKTOK'],
    creativeDirection: 'Create scroll-stopping content that represents our brand. Trendy formats, engaging hooks, the kind of content people share.',
    compensationType: 'FLAT_FEE',
  },
  get_quality_content: {
    campaignGoal: 'GENERAL_CONTENT',
    titleTemplate: 'Brand Content for {name}',
    contentTypes: ['REEL', 'PHOTO_SET'],
    creativeDirection: 'High-quality, versatile content we can use across our website, social media, and ads. Professional but authentic.',
    compensationType: 'FLAT_FEE',
  },
  stand_out_competitors: {
    campaignGoal: 'GENERAL_CONTENT',
    titleTemplate: "What Makes {name} Different",
    contentTypes: ['REEL', 'CAROUSEL'],
    creativeDirection: "Highlight what makes us unique — the details, the craft, the story that no one else has. Show why we're worth the visit.",
    compensationType: 'FLAT_FEE',
  },
};

function getDefaultPrefill() {
  return {
    campaignGoal: 'GENERAL_CONTENT',
    titleTemplate: 'Content Brief',
    contentTypes: ['REEL'],
    creativeDirection: '',
    compensationType: 'FLAT_FEE',
  };
}

// ─── Main Component ───

export default function CreateBrief() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { addToast } = useToast();

  // Determine prefill from profile goals
  const goalKey = profile?.brandGoals?.primary;
  const brandName = profile?.businessName || '';
  const prefill = GOAL_PREFILLS[goalKey] || getDefaultPrefill();

  const [form, setForm] = useState({
    title: prefill.titleTemplate.replace('{name}', brandName),
    campaignGoal: prefill.campaignGoal,
    contentTypes: [...prefill.contentTypes],
    creativeDirection: prefill.creativeDirection,
    compensationType: prefill.compensationType,
    compensationAmount: '',
    deadline: '',
    dos: '',
    donts: '',
    usageRights: 'ALL',
    locationRequirement: 'IN_PERSON',
    numberOfDeliverables: 1,
    additionalNotes: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [autoSaveStatus, setAutoSaveStatus] = useState('');

  const autoSaveTimerRef = useRef(null);
  const formInitializedRef = useRef(false);

  // ─── Restore from localStorage on mount ───
  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTO_SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && parsed.title !== undefined) {
          setForm(parsed);
          setAutoSaveStatus('Draft restored');
          setTimeout(() => setAutoSaveStatus(''), 3000);
        }
      }
    } catch {
      // Ignore parse errors
    }
    formInitializedRef.current = true;
  }, []);

  // ─── Auto-save to localStorage on form changes (debounced) ───
  useEffect(() => {
    if (!formInitializedRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(AUTO_SAVE_KEY, JSON.stringify(form));
        setAutoSaveStatus('Auto-saved');
        setTimeout(() => setAutoSaveStatus(''), 2000);
      } catch {
        // Ignore storage errors
      }
    }, AUTO_SAVE_DELAY);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [form]);

  const clearAutoSave = useCallback(() => {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
    } catch {
      // Ignore
    }
  }, []);

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
    if (fieldErrors[field]) setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggleContentType = (type) => {
    setForm((prev) => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter((t) => t !== type)
        : [...prev.contentTypes, type],
    }));
    setError('');
  };

  const needsAmount =
    form.compensationType === 'FLAT_FEE' || form.compensationType === 'HYBRID';

  // ─── Validation ───

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = 'Title is required.';
    if (form.contentTypes.length === 0) errors.contentTypes = 'Select at least one content type.';
    if (!form.creativeDirection.trim()) errors.creativeDirection = 'Creative direction is required.';
    if (!form.compensationType) errors.compensationType = 'Select a compensation type.';
    if (needsAmount && (!form.compensationAmount || Number(form.compensationAmount) <= 0))
      errors.compensationAmount = 'Enter the compensation amount.';
    if (!form.deadline) errors.deadline = 'Set a deadline.';
    return errors;
  };

  // ─── Submit ───

  const handlePublish = async () => {
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setError('Please complete all required fields.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        title: form.title.trim(),
        campaignGoal: form.campaignGoal,
        contentTypes: form.contentTypes,
        numberOfDeliverables: Number(form.numberOfDeliverables),
        creativeDirection: form.creativeDirection.trim(),
        dos: form.dos.trim() || null,
        donts: form.donts.trim() || null,
        deadline: form.deadline || null,
        compensationType: form.compensationType,
        compensationAmount: needsAmount
          ? Math.round(Number(form.compensationAmount) * 100)
          : null,
        usageRights: form.usageRights,
        locationRequirement: form.locationRequirement,
        additionalNotes: form.additionalNotes.trim() || null,
        status: 'OPEN',
      };

      const res = await createBrief(payload);
      clearAutoSave();
      addToast('Brief published successfully!', 'success');
      const briefId = res.data?.brief?.id || res.data?.id;
      navigate(briefId ? `/operator/brief/${briefId}` : '/operator/dashboard');
    } catch (err) {
      const msg = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-bgWarm">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-display text-3xl font-bold text-dark mb-1">
                Create a Brief
              </h1>
              <p className="font-body text-muted text-sm">
                We pre-filled this based on your goals. Tweak anything, then publish.
              </p>
            </div>
            <Btn variant="ghost" onClick={() => navigate('/operator/dashboard')}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Dashboard
            </Btn>
          </div>
        </FadeIn>

        {/* Auto-save status */}
        {autoSaveStatus && (
          <div className="flex items-center gap-1.5 mb-4 text-xs text-muted font-body">
            <svg className="w-3.5 h-3.5 text-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {autoSaveStatus}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-700 font-body">{error}</p>
          </div>
        )}

        <FadeIn delay={0.1}>
          <div className="card space-y-6">
            {/* Title */}
            <div>
              <label className={labelClass}>
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Summer Menu Launch Reel"
                className={`${inputClass} ${fieldErrors.title ? 'border-red-400 focus:ring-red-200' : ''}`}
              />
              {fieldErrors.title && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.title}</p>}
            </div>

            {/* Creative Direction */}
            <div>
              <label className={labelClass}>
                Creative Direction <span className="text-red-400">*</span>
                <span className="float-right text-xs font-normal text-muted">{form.creativeDirection.length}/500</span>
              </label>
              <textarea
                value={form.creativeDirection}
                onChange={(e) => updateField('creativeDirection', e.target.value)}
                placeholder="Describe the look, feel, and story you want the content to tell..."
                rows={4}
                maxLength={500}
                className={`${inputClass} resize-none ${fieldErrors.creativeDirection ? 'border-red-400' : ''}`}
              />
              {fieldErrors.creativeDirection && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.creativeDirection}</p>}
            </div>

            {/* Content Types */}
            <div>
              <label className={labelClass}>
                Content Types <span className="text-red-400">*</span>
              </label>
              {fieldErrors.contentTypes && <p className="mb-2 text-xs text-red-600 font-body">{fieldErrors.contentTypes}</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CONTENT_TYPES.map((ct) => (
                  <label
                    key={ct.value}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border cursor-pointer transition-all text-sm font-body ${
                      form.contentTypes.includes(ct.value)
                        ? 'border-accent bg-accent/5 text-dark'
                        : 'border-border bg-white text-mid hover:border-accent/40'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.contentTypes.includes(ct.value)}
                      onChange={() => toggleContentType(ct.value)}
                      className="accent-accent w-4 h-4"
                    />
                    {ct.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Deadline */}
            <div>
              <label className={labelClass}>
                Deadline <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={form.deadline}
                onChange={(e) => updateField('deadline', e.target.value)}
                className={`${inputClass} ${fieldErrors.deadline ? 'border-red-400 focus:ring-red-200' : ''}`}
              />
              {fieldErrors.deadline && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.deadline}</p>}
            </div>

            {/* Compensation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>
                  Compensation Type <span className="text-red-400">*</span>
                </label>
                <select
                  value={form.compensationType}
                  onChange={(e) => updateField('compensationType', e.target.value)}
                  className={`${selectClass} ${fieldErrors.compensationType ? 'border-red-400 focus:ring-red-200' : ''}`}
                >
                  <option value="">Select...</option>
                  {COMPENSATION_TYPES.map((ct) => (
                    <option key={ct.value} value={ct.value}>{ct.label}</option>
                  ))}
                </select>
                {fieldErrors.compensationType && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.compensationType}</p>}
              </div>
              {needsAmount && (
                <div>
                  <label className={labelClass}>
                    Amount ($) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.compensationAmount}
                    onChange={(e) => updateField('compensationAmount', e.target.value)}
                    placeholder="e.g. 150"
                    className={`${inputClass} ${fieldErrors.compensationAmount ? 'border-red-400 focus:ring-red-200' : ''}`}
                  />
                  {fieldErrors.compensationAmount && <p className="mt-1 text-xs text-red-600 font-body">{fieldErrors.compensationAmount}</p>}
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <details className="group">
              <summary className="flex items-center gap-2 cursor-pointer text-sm font-medium text-accent font-body select-none">
                <svg className="w-4 h-4 transition-transform group-open:rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
                Advanced Settings
              </summary>
              <div className="mt-4 space-y-5 pl-1">
                {/* Do's */}
                <div>
                  <label className={labelClass}>
                    Do's <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.dos}
                    onChange={(e) => updateField('dos', e.target.value)}
                    placeholder="e.g. Show the patio, mention happy hour, tag us..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Don'ts */}
                <div>
                  <label className={labelClass}>
                    Don'ts <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.donts}
                    onChange={(e) => updateField('donts', e.target.value)}
                    placeholder="e.g. No competitor logos, don't film the kitchen..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                {/* Usage Rights */}
                <div>
                  <label className={labelClass}>Usage Rights</label>
                  <select
                    value={form.usageRights}
                    onChange={(e) => updateField('usageRights', e.target.value)}
                    className={selectClass}
                  >
                    {USAGE_RIGHTS.map((ur) => (
                      <option key={ur.value} value={ur.value}>{ur.label}</option>
                    ))}
                  </select>
                </div>

                {/* Location Requirement */}
                <div>
                  <label className={labelClass}>Location Requirement</label>
                  <select
                    value={form.locationRequirement}
                    onChange={(e) => updateField('locationRequirement', e.target.value)}
                    className={selectClass}
                  >
                    {LOCATION_REQUIREMENTS.map((lr) => (
                      <option key={lr.value} value={lr.value}>{lr.label}</option>
                    ))}
                  </select>
                </div>

                {/* Number of Deliverables */}
                <div>
                  <label className={labelClass}>Number of Deliverables</label>
                  <input
                    type="number"
                    min={1}
                    value={form.numberOfDeliverables}
                    onChange={(e) => updateField('numberOfDeliverables', e.target.value)}
                    className={inputClass}
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className={labelClass}>
                    Additional Notes <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.additionalNotes}
                    onChange={(e) => updateField('additionalNotes', e.target.value)}
                    placeholder="Anything else the creator should know..."
                    rows={2}
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            </details>

            {/* Publish Button */}
            <div className="pt-4 border-t border-border">
              <Btn onClick={handlePublish} loading={submitting} disabled={submitting} className="w-full" size="lg">
                Publish Brief
              </Btn>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
